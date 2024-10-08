// const express = require("express");
// const cors = require("cors");
// const mysql = require("mysql2/promise"); // Подключаем mysql2 с поддержкой async/await
// const svgCaptcha = require("svg-captcha");
// const multer = require("multer"); // Для загрузки файлов
// const sharp = require("sharp"); // Для изменения размера изображений
// const path = require("path");
// const fs = require("fs");
// const xss = require("xss-clean");
// const sanitizeHtml = require("sanitize-html");
// const app = express();
// const http = require("http").Server(app);
// const socketIO = require("socket.io")(http, {
// 	cors: {
// 		origin: "http://localhost:5173",
// 	},
// });

// const { db, connectDB } = require("./config/db");

// const PORT = 5000;
// const HOST = "localhost";
// const MESSAGES_PER_PAGE = 25;
// let captchas = {};

// // Разрешаем CORS для всех маршрутов
// app.use(
// 	cors({
// 		origin: "http://localhost:5173", // Убедитесь, что здесь правильный origin
// 		methods: "GET,POST",
// 		credentials: true, // Это может понадобиться для передачи данных о сессиях
// 	})
// );

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use("/uploads", express.static("uploads"));
// // Используем xss-clean как middleware для очистки входящих данных
// app.use(xss());

// // Конфигурация multer для загрузки файлов
// const storage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		const dir = "./uploads";
// 		if (!fs.existsSync(dir)) {
// 			fs.mkdirSync(dir);
// 		}
// 		cb(null, "uploads/"); // Директория для загрузки
// 	},
// 	filename: function (req, file, cb) {
// 		cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
// 	},
// });

// const upload = multer({
// 	storage: storage,
// 	fileFilter: function (req, file, cb) {
// 		const filetypes = /jpeg|jpg|png|gif|txt/;
// 		const extname = filetypes.test(
// 			path.extname(file.originalname).toLowerCase()
// 		);
// 		const mimetype = file.mimetype;

// 		if (extname && mimetype) {
// 			if (mimetype === "text/plain") {
// 				// Для текстовых файлов задаем лимит 100 КБ
// 				if (file.size > 100 * 1024) {
// 					return cb(new Error("Text file exceeds 100KB"));
// 				}
// 			} else if (/image\/(jpeg|png|gif)/.test(mimetype)) {
// 				// Для изображений задаем лимит 1 МБ
// 				if (file.size > 1 * 1024 * 1024) {
// 					return cb(new Error("Image file exceeds 1MB"));
// 				}
// 			}
// 			return cb(null, true);
// 		}
// 		cb(new Error("Invalid file type. Only images and text files are allowed."));
// 	},
// });

// // Обработка изображений: загрузка и ресайз
// app.post("/upload-image", upload.single("image"), async (req, res) => {
// 	if (!req.file) {
// 		return res.status(400).send({ message: "No file uploaded" });
// 	}
// 	const filePath = req.file.path;
// 	const resizedFilePath = `uploads/resized_${req.file.filename}`;

// 	try {
// 		// Изменение размера изображения
// 		await sharp(filePath)
// 			.resize(320, 240, { fit: sharp.fit.inside, withoutEnlargement: true })
// 			.toFile(resizedFilePath);

// 		// Добавляем задержку перед удалением файла
// 		setTimeout(async () => {
// 			try {
// 				if (await fs.promises.access(filePath)) {
// 					await fs.promises.unlink(filePath);
// 				}
// 			} catch (err) {
// 				console.error("Ошибка при удалении файла:", err);
// 			}
// 		}, 1000);

// 		res.status(200).json({ imageUrl: `/uploads/resized_${req.file.filename}` });
// 	} catch (error) {
// 		console.error("Ошибка при обработке изображения:", error);
// 		res.status(500).json({ message: "Ошибка обработки изображения" });
// 	}
// });

// // Маршрут для загрузки текстового файла
// app.post("/upload-file", upload.single("file"), async (req, res) => {
// 	if (!req.file) {
// 		return res.status(400).send({ message: "No file uploaded" });
// 	}

// 	const filePath = req.file.path;
// 	const fileSize = req.file.size;

// 	try {
// 		// Если текстовый файл превышает 100 КБ, удаляем его
// 		if (
// 			path.extname(filePath).toLowerCase() === ".txt" &&
// 			fileSize > 100 * 1024
// 		) {
// 			await fs.promises.unlink(filePath);
// 			return res.status(400).json({ message: "Text file exceeds 100KB" });
// 		}

// 		// Логируем путь к файлу для проверки
// 		console.log("Текстовый файл загружен по адресу:", filePath);

// 		// Отправляем путь к файлу обратно клиенту
// 		res.status(200).json({ fileUrl: `/uploads/${req.file.filename}` });
// 	} catch (error) {
// 		console.error("Ошибка при загрузке файла:", error);
// 		res.status(500).json({ message: "Ошибка загрузки файла" });
// 	}
// });

// // Конфигурация sanitize-html для разрешения определенных тегов и атрибутов
// const sanitizeOptions = {
// 	allowedTags: ["a", "code", "i", "strong"],
// 	allowedAttributes: {
// 		a: ["href", "title"],
// 	},
// 	allowedSchemes: ["http", "https"], // Разрешаем только HTTP/HTTPS ссылки
// };

// // Очистка текста, разрешая только определенные теги
// function sanitizeMessage(text) {
// 	return sanitizeHtml(text, sanitizeOptions);
// }

// // Подключение к базе данных MySQL
// // const db = mysql.createPool({
// // 	host: HOST,
// // 	user: "root",
// // 	password: "Kd73PkjwqPSeZQaTA",
// // 	database: "chat_socket",
// // });

// // Генерация CAPTCHA
// app.get("/captcha", (req, res) => {
// 	const captcha = svgCaptcha.create();
// 	const ip = req.ip;
// 	captchas[ip] = captcha.text;
// 	res.type("svg");
// 	res.status(200).send(captcha.data);
// });

// // Добавляем новый маршрут для получения основных комментариев с сортировкой
// app.get("/api/main-comments", async (req, res) => {
// 	try {
// 		const { sort, order } = req.query;
// 		let orderBy = "timestamp";
// 		if (sort === "username") orderBy = "name";
// 		else if (sort === "email") orderBy = "email";
// 		else if (sort === "date") orderBy = "timestamp";

// 		const orderDirection = order === "asc" ? "ASC" : "DESC";

// 		// Получаем все сообщения, а не только главные комментарии
// 		const [allMessages] = await db.query(
// 			`SELECT * FROM messages ORDER BY ${orderBy} ${orderDirection}`
// 		);

// 		// Строим дерево сообщений
// 		const messageTree = buildMessageTree(allMessages);

// 		res.json(messageTree);
// 	} catch (error) {
// 		console.error("Ошибка при получении комментариев:", error);
// 		res.status(500).json({ error: "Внутренняя ошибка сервера" });
// 	}
// });

// // Проверка CAPTCHA
// function validateCaptcha(ip, inputCaptcha) {
// 	return (
// 		captchas[ip] && captchas[ip].toLowerCase() === inputCaptcha.toLowerCase()
// 	);
// }

// // Функция для создания таблицы, если она не существует
// // const createTables = async () => {
// // 	try {
// // 		await db.query(`
// //             CREATE TABLE IF NOT EXISTS messages (
// //                 id INT AUTO_INCREMENT PRIMARY KEY,
// //                 name VARCHAR(255) NOT NULL,
// //                 email VARCHAR(255) NOT NULL,
// //                 homepage VARCHAR(255),
// //                 text TEXT NOT NULL,
// //                 parentid INT,
// //                 quotetext TEXT,
// //                 timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
// //             )
// //         `);
// // 	} catch (err) {
// // 		console.error("Ошибка при создании таблицы:", err);
// // 	}
// // };
// // createTables();

// app.get("/api", (req, res) => {
// 	res.json({
// 		message: "Hello",
// 	});
// });

// let users = [];

// // Функция для проверки длины сообщения
// function validateMessageLength(text) {
// 	return text.length > 0 && text.length <= 1000; //  лимит в 1000 символов
// }

// socketIO.on("connect", (socket) => {
// 	console.log(`${socket.id} user connected`);

// 	socket.on("newUser", (data) => {
// 		const existingUser = users.find((user) => user.socketID === socket.id);
// 		if (!existingUser) {
// 			users.push({ user: data.user, socketID: socket.id });
// 			socketIO.emit("responseNewUser", users);
// 		}
// 	});

// 	socket.on("message", async (data) => {
// 		// Валидация полей
// 		const {
// 			name,
// 			email,
// 			homepage,
// 			text,
// 			parentId,
// 			quotetext,
// 			imageUrl,
// 			textFileUrl,
// 		} = data;

// 		// Очистка текстов от потенциально опасных данных, разрешаем только определенные теги
// 		const sanitizedText = sanitizeMessage(text);
// 		const sanitizedQuoteText = sanitizeMessage(quotetext || "");

// 		if (!name || !email || !validateMessageLength(text)) {
// 			return socket.emit("error", {
// 				message: "Заполните все обязательные поля",
// 			});
// 		}

// 		// Валидация CAPTCHA
// 		if (!validateCaptcha(socket.handshake.address, data.captcha)) {
// 			return socket.emit("error", { message: "Неверная CAPTCHA" });
// 		}

// 		// Проверка на валидность email
// 		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 		if (!emailRegex.test(email)) {
// 			return socket.emit("error", { message: "Неправильный формат email" });
// 		}

// 		// Проверка на валидность URL для домашней страницы (если указана)
// 		if (homepage) {
// 			const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
// 			if (!urlRegex.test(homepage)) {
// 				return socket.emit("error", { message: "Неправильный формат URL" });
// 			}
// 		}

// 		// Сохранение сообщения в MySQL
// 		try {
// 			const [result] = await db.query(
// 				`INSERT INTO messages (name, email, homepage, text, parentid, quotetext, imageUrl, textFileUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
// 				[
// 					name,
// 					email,
// 					homepage || null,
// 					text,
// 					parentId || null,
// 					quotetext || null,
// 					imageUrl || null,
// 					textFileUrl || null,
// 				]
// 			);

// 			const newMessage = {
// 				id: result.insertId,
// 				name,
// 				email,
// 				homepage,
// 				text,
// 				parentId,
// 				quotetext,
// 				imageUrl,
// 				textFileUrl, // Сохраняем текстовый файл в объекте
// 				timestamp: new Date().toISOString(),
// 			};

// 			socketIO.emit("newMessage", { newMessage });

// 			// Отправляем обновленную первую страницу сообщений
// 			const updatedFirstPage = await getMessagesPage(1);
// 			socketIO.emit("messagesPage", {
// 				messages: updatedFirstPage,
// 				totalPages: await getTotalPages(),
// 				currentPage: 1,
// 			});
// 		} catch (err) {
// 			console.error("Ошибка при сохранении сообщения:", err);
// 			socket.emit("error", { message: "Ошибка при сохранении сообщения" });
// 		}
// 	});

// 	socket.on("getMessages", async (page) => {
// 		const messagesPage = await getMessagesPage(page);
// 		socket.emit("messagesPage", {
// 			messages: messagesPage,
// 			totalPages: await getTotalPages(),
// 			currentPage: page,
// 		});
// 	});

// 	socket.on("logout", ({ user, socketID }) => {
// 		users = users.filter((u) => u.socketID !== socketID);
// 		socketIO.emit("responseNewUser", users);
// 		console.log(`${user} (${socketID}) has left the chat`);
// 	});

// 	socket.on("disconnect", () => {
// 		users = users.filter((u) => u.socketID !== socket.id);
// 		socketIO.emit("responseNewUser", users);
// 		console.log(`${socket.id} disconnected`);
// 	});
// });

// // Функция для построения дерева сообщений из списка
// function buildMessageTree(messages) {
// 	const messageMap = new Map();
// 	const roots = [];

// 	// Первый проход: создаем map всех сообщений
// 	messages.forEach((msg) => {
// 		msg.replies = [];
// 		messageMap.set(msg.id, msg);
// 	});

// 	// Второй проход: строим дерево
// 	messages.forEach((msg) => {
// 		if (msg.parentid) {
// 			const parent = messageMap.get(msg.parentid);
// 			if (parent) {
// 				parent.replies.push(msg);
// 			} else {
// 				// Если родитель не найден, добавляем как корневое сообщение
// 				roots.push(msg);
// 			}
// 		} else {
// 			roots.push(msg);
// 		}
// 	});

// 	return roots; // Возвращаем корневые сообщения с вложенными ответами
// }

// // Функция для получения страницы сообщений из базы данных
// async function getMessagesPage(page) {
// 	const offset = (page - 1) * MESSAGES_PER_PAGE;
// 	const [messages] = await db.query(
// 		"SELECT * FROM messages ORDER BY timestamp ASC LIMIT ? OFFSET ?",
// 		[MESSAGES_PER_PAGE, offset]
// 	);

// 	// Строим дерево сообщений
// 	return buildMessageTree(messages);
// }

// // Функция для получения общего количества страниц
// async function getTotalPages() {
// 	const [rows] = await db.query("SELECT COUNT(*) AS count FROM messages");
// 	const totalMessages = rows[0].count;
// 	return Math.ceil(totalMessages / MESSAGES_PER_PAGE);
// }

// // Start server
// const start = async () => {
// 	try {
// 		await connectDB();
// 		http.listen(PORT, (err) => {
// 			err
// 				? console.log(err)
// 				: console.log(`Server running on http://${HOST}:${PORT}`);
// 		});
// 	} catch (err) {
// 		console.error("Error starting the server:", err);
// 	}
// };

// start();

const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const xss = require("xss-clean");
const apiRoutes = require("./routes/api");
const { connectDB } = require("./config/db");
const socketHandlers = require("./utils/socketHandlers");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
	cors: {
		origin: "http://localhost:5173",
	},
});

const PORT = 5000;
const HOST = "localhost";

// Middleware
app.use(
	cors({
		origin: "http://localhost:5173",
		methods: ["GET", "POST"],
		credentials: true,
	})
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(xss());

// Routes
app.use("/api", apiRoutes);

// Socket.IO
socketHandlers(io);

// Start server
const start = async () => {
	try {
		await connectDB();
		server.listen(PORT, () => {
			console.log(`Server running on http://${HOST}:${PORT}`);
		});
	} catch (err) {
		console.error("Error starting the server:", err);
	}
};

start();
