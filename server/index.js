const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const xss = require("xss-clean");
const apiRoutes = require("./routes/api");
const { connectDB } = require("./config/db");
const socketHandlers = require("./utils/socketHandlers");

const CLIENT_URL =
	process.env.CLIENT_URL || "https://mindful-success-frontend.up.railway.app";

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
	cors: {
		origin: CLIENT_URL.replace(/\/$/, ""), // Разрешаем запросы с фронтенда
		methods: ["GET", "POST"],
		credentials: true, // Включаем передачу куки
	},
});

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

// Middleware
app.use(
	cors({
		origin: CLIENT_URL.replace(/\/$/, ""),
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
