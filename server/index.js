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
