const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise"); // Подключаем mysql2 с поддержкой async/await
const svgCaptcha = require("svg-captcha");
const app = express();
const http = require("http").Server(app);
const socketIO = require("socket.io")(http, {
	cors: {
		origin: "http://localhost:5173",
	},
});

const PORT = 5000;
const HOST = "localhost";
const MESSAGES_PER_PAGE = 25;
let captchas = {};

// Разрешаем CORS для всех маршрутов
app.use(cors({ origin: "http://localhost:5173" }));

// Подключение к базе данных MySQL
const db = mysql.createPool({
	host: HOST,
	user: "root",
	password: "Kd73PkjwqPSeZQaTA",
	database: "chat_socket",
});

// Генерация CAPTCHA
app.get("/captcha", (req, res) => {
	const captcha = svgCaptcha.create();
	const ip = req.ip;
	captchas[ip] = captcha.text;
	res.type("svg");
	res.status(200).send(captcha.data);
});

// Проверка CAPTCHA
function validateCaptcha(ip, inputCaptcha) {
	return (
		captchas[ip] && captchas[ip].toLowerCase() === inputCaptcha.toLowerCase()
	);
}

// Функция для создания таблицы, если она не существует
const createTables = async () => {
	try {
		await db.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                homepage VARCHAR(255),
                text TEXT NOT NULL,
                parentid INT,
                quotetext TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
	} catch (err) {
		console.error("Ошибка при создании таблицы:", err);
	}
};
createTables();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
	res.json({
		message: "Hello",
	});
});

let users = [];

socketIO.on("connect", (socket) => {
	console.log(`${socket.id} user connected`);

	socket.on("newUser", (data) => {
		const existingUser = users.find((user) => user.socketID === socket.id);
		if (!existingUser) {
			users.push({ user: data.user, socketID: socket.id });
			socketIO.emit("responseNewUser", users);
		}
	});

	socket.on("message", async (data) => {
		// Валидация полей
		const { name, email, homepage, text, parentId, quotetext } = data;
		if (!name || !email || !text) {
			return socket.emit("error", {
				message: "Заполните все обязательные поля",
			});
		}

		// Валидация CAPTCHA
		if (!validateCaptcha(socket.handshake.address, data.captcha)) {
			return socket.emit("error", { message: "Неверная CAPTCHA" });
		}

		// Проверка на валидность email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return socket.emit("error", { message: "Неправильный формат email" });
		}

		// Проверка на валидность URL для домашней страницы (если указана)
		if (homepage) {
			const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
			if (!urlRegex.test(homepage)) {
				return socket.emit("error", { message: "Неправильный формат URL" });
			}
		}

		// Сохранение сообщения в MySQL
		try {
			const [result] = await db.query(
				`INSERT INTO messages (name, email, homepage, text, parentid, quotetext) VALUES (?, ?, ?, ?, ?, ?)`,
				[
					name,
					email,
					homepage || null,
					text,
					parentId || null,
					quotetext || null,
				]
			);
			const newMessage = {
				id: result.insertId,
				name,
				email,
				homepage,
				text,
				parentId,
				quotetext,
				timestamp: new Date().toISOString(),
			};

			socketIO.emit("newMessage", { newMessage });

			// Отправляем обновленную первую страницу сообщений
			const updatedFirstPage = await getMessagesPage(1);
			socketIO.emit("messagesPage", {
				messages: updatedFirstPage,
				totalPages: await getTotalPages(),
				currentPage: 1,
			});
		} catch (err) {
			console.error("Ошибка при сохранении сообщения:", err);
			socket.emit("error", { message: "Ошибка при сохранении сообщения" });
		}
	});

	socket.on("getMessages", async (page) => {
		const messagesPage = await getMessagesPage(page);
		socket.emit("messagesPage", {
			messages: messagesPage,
			totalPages: await getTotalPages(),
			currentPage: page,
		});
	});

	socket.on("typing", (data) => socket.broadcast.emit("responseTyping", data));

	socket.on("logout", ({ user, socketID }) => {
		users = users.filter((u) => u.socketID !== socketID);
		socketIO.emit("responseNewUser", users);
		console.log(`${user} (${socketID}) has left the chat`);
	});

	socket.on("disconnect", () => {
		users = users.filter((u) => u.socketID !== socket.id);
		socketIO.emit("responseNewUser", users);
		console.log(`${socket.id} disconnected`);
	});
});

// Функция для построения дерева сообщений из списка
function buildMessageTree(messages) {
	const messageMap = new Map();
	const roots = [];

	// Преобразуем список сообщений в карту по id
	messages.forEach((msg) => {
		msg.replies = []; // Инициализируем массив ответов
		messageMap.set(msg.id, msg);

		// Если это корневое сообщение (нет parentid), добавляем в список корневых
		if (!msg.parentid) {
			roots.push(msg);
		}
	});

	// Привязываем ответы к их родительским сообщениям
	messages.forEach((msg) => {
		if (msg.parentid) {
			const parent = messageMap.get(msg.parentid);
			if (parent) {
				parent.replies.push(msg); // Добавляем ответ в массив replies родительского сообщения
			}
		}
	});

	return roots; // Возвращаем корневые сообщения с вложенными ответами
}

// Функция для получения страницы сообщений из базы данных
async function getMessagesPage(page) {
	const offset = (page - 1) * MESSAGES_PER_PAGE;
	const [messages] = await db.query(
		"SELECT * FROM messages ORDER BY timestamp ASC LIMIT ? OFFSET ?",
		[MESSAGES_PER_PAGE, offset]
	);

	// Строим дерево сообщений
	return buildMessageTree(messages);
}

// Функция для получения общего количества страниц
async function getTotalPages() {
	const [rows] = await db.query("SELECT COUNT(*) AS count FROM messages");
	const totalMessages = rows[0].count;
	return Math.ceil(totalMessages / MESSAGES_PER_PAGE);
}

const start = async () => {
	try {
		http.listen(PORT, (err) => {
			err
				? console.log(err)
				: console.log(`Server running on http://${HOST}:${PORT}`);
		});
	} catch (err) {
		console.error("Error starting the server:", err);
	}
};

start();
