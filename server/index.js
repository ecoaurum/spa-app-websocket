// Импорт необходимых библиотек и модулей
const express = require("express");
const cors = require("cors"); // CORS для разрешения междоменных запросов
const http = require("http"); // Встроенный модуль для создания HTTP сервера
const socketIO = require("socket.io"); // Библиотека для работы с WebSockets
const xss = require("xss-clean"); // Модуль для защиты от XSS-атак

const apiRoutes = require("./routes/api"); // Маршруты API для обработки HTTP-запросов
const { connectDB } = require("./config/db"); // Подключение к базе данных
const socketHandlers = require("./utils/socketHandlers"); // Обработчики событий для WebSocket-соединений

// Получение URL клиента из переменных окружения
const CLIENT_URL =
	process.env.CLIENT_URL || "https://mindful-success-frontend.up.railway.app";

const app = express(); // Создание экземпляра Express-приложения
const server = http.createServer(app); // Создание HTTP-сервера на основе Express-приложения

// Конфигурация Socket.IO с разрешением междоменных запросов (CORS)
const io = socketIO(server, {
	cors: {
		origin: CLIENT_URL.replace(/\/$/, ""), // Разрешаем запросы с фронтенда, убирая лишние слэши
		methods: ["GET", "POST"], // Разрешаем методы GET и POST
		credentials: true, // Включаем передачу куки
	},
});

// Установка порта для сервера из переменных окружения
const PORT = process.env.PORT || 5000;
// Определение хоста (0.0.0.0 означает, что сервер будет доступен по любому IP-адресу)
const HOST = "0.0.0.0";

// Middleware для обработки запросов
app.use(
	cors({
		origin: CLIENT_URL.replace(/\/$/, ""), // Настройка CORS для разрешения запросов с фронтенда
		methods: ["GET", "POST"], // Разрешённые методы
		credentials: true, // Включение передачи куки
	})
);
app.use(express.json()); // Middleware для парсинга JSON из тела запроса
app.use("/uploads", express.static("uploads")); // Предоставление статических файлов (загруженные файлы) из директории "uploads"
app.use(xss()); // Middleware для защиты от XSS (очистка входных данных)

// Routes - подключение маршрутов API
app.use("/api", apiRoutes);

// Инициализация обработчиков WebSocket соединений
socketHandlers(io); // Обработчики событий WebSocket подключаются к серверу

// Функция для запуска сервера
const start = async () => {
	try {
		await connectDB(); // Подключение к базе данных и создание таблицы, если она не существует
		server.listen(PORT, () => {
			console.log(`Server running on http://${HOST}:${PORT}`); // Логирование успешного запуска сервера
		});
	} catch (err) {
		console.error("Error starting the server:", err); // Логирование ошибки, если сервер не удалось запустить
	}
};
// Вызов функции для старта сервера
start();
