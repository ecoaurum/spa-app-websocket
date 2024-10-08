const { validateCaptcha } = require("../controllers/captchaController");
const {
	createMessage,
	getMessagesPage,
	getTotalPages,
} = require("../controllers/messageController");

let users = [];

function validateMessageLength(text) {
	return text.length > 0 && text.length <= 1000;
}

function validateEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function validateUrl(url) {
	const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
	return urlRegex.test(url);
}

module.exports = (io) => {
	io.on("connect", (socket) => {
		console.log(`${socket.id} user connected`);

		socket.on("newUser", (data) => {
			const existingUser = users.find((user) => user.socketID === socket.id);
			if (!existingUser) {
				users.push({ user: data.user, socketID: socket.id });
				io.emit("responseNewUser", users);
			}
		});

		socket.on("message", async (data) => {
			const { name, email, text } = data;

			if (!name || !email || !validateMessageLength(text)) {
				return socket.emit("error", { message: "Fill in all required fields" });
			}

			if (!validateCaptcha(socket.handshake.address, data.captcha)) {
				return socket.emit("error", { message: "Invalid CAPTCHA" });
			}

			if (!validateEmail(email)) {
				return socket.emit("error", { message: "Invalid email format" });
			}

			if (data.homepage && !validateUrl(data.homepage)) {
				return socket.emit("error", { message: "Invalid URL format" });
			}

			try {
				const newMessage = await createMessage(data);
				io.emit("newMessage", { newMessage });

				const updatedFirstPage = await getMessagesPage(1);
				io.emit("messagesPage", {
					messages: updatedFirstPage,
					totalPages: await getTotalPages(),
					currentPage: 1,
				});
			} catch (err) {
				console.error("Error saving message:", err);
				socket.emit("error", { message: "Error saving message" });
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

		socket.on("logout", ({ user, socketID }) => {
			users = users.filter((u) => u.socketID !== socketID);
			io.emit("responseNewUser", users);
			console.log(`${user} (${socketID}) has left the chat`);
		});

		socket.on("disconnect", () => {
			users = users.filter((u) => u.socketID !== socket.id);
			io.emit("responseNewUser", users);
			console.log(`${socket.id} disconnected`);
		});
	});
};
