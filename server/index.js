const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http").Server(app);
const socketIO = require("socket.io")(http, {
	cors: {
		origin: "http://localhost:5173",
	},
});

const PORT = 5000;
const HOST = "localhost";

app.get("api", (req, res) => {
	res.json({
		message: "Hello",
	});
});

let users = []; // Храним информацию о пользователях

socketIO.on("connect", (socket) => {
	console.log(`${socket.id} user connected`);

	socket.on("newUser", (data) => {
		// Проверяем, есть ли пользователь с таким же socketID
		const existingUser = users.find((user) => user.socketID === socket.id);
		if (!existingUser) {
			// Если пользователь с таким socketID не найден, добавляем его
			users.push({ user: data.user, socketID: socket.id });
			socketIO.emit("responseNewUser", users);
		}
	});

	// socket.on("message", (data) => {
	// 	socketIO.emit("response", data);
	// });

	// Обработчик события отправки сообщения
	socket.on("message", (data) => {
		const message = {
			...data, // включаем существующие поля (текст, имя пользователя и т.д.)
			parentId: data.parentId || null, // добавляем поле parentId для хранения ID родительского сообщения
		};
		socketIO.emit("response", message); // отправляем сообщение всем пользователям
	});

	socket.on("typing", (data) => socket.broadcast.emit("responseTyping", data));

	// Новое событие для удаления пользователя при логауте
	socket.on("logout", ({ user, socketID }) => {
		// console.log(`Logout received: ${user} with socketID ${socketID}`);
		users = users.filter((u) => u.socketID !== socketID); // Удаляем пользователя по socketID
		socketIO.emit("responseNewUser", users); // Обновляем список пользователей
		console.log(`${user} (${socketID}) has left the chat`); // Логируем факт выхода
	});

	// Обновлённая обработка отключения пользователя
	socket.on("disconnect", () => {
		users = users.filter((u) => u.socketID !== socket.id); // Удаляем пользователя по его socketID
		socketIO.emit("responseNewUser", users); // Обновляем список пользователей
		console.log(`${socket.id} disconnected`); // Логируем разрыв соединения
	});
});

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
