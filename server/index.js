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

let users = [];
let messages = [];

socketIO.on("connect", (socket) => {
	console.log(`${socket.id} user connected`);

	socket.on("newUser", (data) => {
		const existingUser = users.find((user) => user.socketID === socket.id);
		if (!existingUser) {
			users.push({ user: data.user, socketID: socket.id });
			socketIO.emit("responseNewUser", users);
		}
	});

	socket.on("message", (data) => {
		const newMessage = {
			id: `${socket.id}-${Date.now()}`,
			...data,
			parentId: data.parentId || null,
			replies: [],
			quoteText: data.quoteText || null,
			timestamp: new Date().toISOString(),
		};

		if (data.parentId) {
			const parentMessage = findMessageById(messages, data.parentId);
			if (parentMessage) {
				parentMessage.replies.push(newMessage);
			}
		} else {
			messages.push(newMessage);
		}

		socketIO.emit("response", newMessage);
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

function findMessageById(messages, id) {
	for (let message of messages) {
		if (message.id === id) {
			return message;
		}
		if (message.replies.length > 0) {
			const found = findMessageById(message.replies, id);
			if (found) return found;
		}
	}
	return null;
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
