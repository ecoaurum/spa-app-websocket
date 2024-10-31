// Импорт необходимых библиотек и модулей
const express = require("express");
const cors = require("cors"); // CORS для разрешения междоменных запросов
const http = require("http"); // Встроенный модуль для создания HTTP сервера
const session = require("express-session"); // Модуль для работы с сессиями
const cookieParser = require("cookie-parser"); // Модуль для парсинга cookie
const socketIO = require("socket.io"); // Библиотека для работы с WebSockets
const xss = require("xss-clean"); // Модуль для защиты от XSS-атак
const { BullAdapter } = require("@bull-board/api/bullAdapter"); // Адаптер Bull для очередей
const { createBullBoard } = require("@bull-board/api"); // Создание интерфейса управления очередями Bull
const { ExpressAdapter } = require("@bull-board/express"); // Адаптер для использования Bull с Express

const apiRoutes = require("./routes/api"); // Маршруты API для обработки HTTP-запросов
const authRoutes = require("./routes/authRoutes"); // Маршруты для авторизации и аутентификации
const { connectDB, sequelize } = require("./config/db"); // Подключение к базе данных
const socketHandlers = require("./utils/socketHandlers"); // Обработчики событий для WebSocket-соединений
const messageQueue = require("./queues/messageQueue"); // Импорт очереди сообщений
const passport = require("./config/passport-config"); // Подключение файла с конфигурацией passport

// Получение URL клиента из переменных окружения
const CLIENT_URL =
	process.env.CLIENT_URL || "https://mindful-success-frontend.up.railway.app";

const app = express(); // Создание экземпляра Express-приложения
const server = http.createServer(app); // Создание HTTP-сервера на основе Express-приложения
const serverAdapter = new ExpressAdapter(); // Создание адаптера для Bull Board

// Установка порта для сервера из переменных окружения
const PORT = process.env.PORT || 5000;
// Определение хоста (0.0.0.0 означает, что сервер будет доступен по любому IP-адресу)
const HOST = "0.0.0.0";

// Создание интерфейса управления очередями Bull и добавление его маршрутов
createBullBoard({
	queues: [new BullAdapter(messageQueue)], // Подключение адаптера Bull
	serverAdapter: serverAdapter, // Указание адаптера сервера
});

serverAdapter.setBasePath("/admin/queues"); // Установка базового маршрута для интерфейса Bull
app.use("/admin/queues", serverAdapter.getRouter()); // Добавление маршрута интерфейса Bull

// Конфигурация Socket.IO с разрешением междоменных запросов (CORS)
const io = socketIO(server, {
	cors: {
		origin: CLIENT_URL.replace(/\/$/, ""), // Разрешаем запросы с фронтенда, убирая лишние слэши
		methods: ["GET", "POST"], // Разрешаем методы GET и POST
		credentials: true, // Включаем передачу куки
	},
});

// Middleware для обработки запросов
app.use(
	cors({
		origin: CLIENT_URL.replace(/\/$/, ""), // Настройка CORS для разрешения запросов с фронтенда
		methods: ["GET", "POST"], // Разрешённые методы
		allowedHeaders: ["Content-Type", "Authorization"], // Разрешенные заголовки
		credentials: true, // Включение передачи куки
	})
);
app.use(express.json()); // Middleware для парсинга JSON из тела запроса
app.use(express.urlencoded({ extended: true })); // Middleware для обработки URL-кодированных данных
app.use(cookieParser()); // Middleware для работы с cookies
app.use(
	session({
		secret: process.env.SESSION_SECRET || "Kd73PkjwqPSeZQaTA", // Секретный ключ для подписания cookie
		resave: false, // Отключение перезаписи сессии при каждом запросе
		saveUninitialized: false, // Отключение создания сессии для неавторизованных пользователей
		cookie: {
			secure: true, // Должен быть false в dev-среде (на локалке)
			maxAge: 24 * 60 * 60 * 1000, // Время жизни cookie в 24 часа
			httpOnly: true, // Cookie доступна только через HTTP и не доступна для JavaScript
			sameSite: "lax", // Для корректной работы cookies между доменами
		},
	})
);
app.use(passport.initialize()); // Инициализация Passport для работы с аутентификацией
app.use(passport.session()); // Подключение сессий Passport
app.use("/uploads", express.static("uploads")); // Предоставление статических файлов (загруженные файлы) из директории "uploads"
app.use(xss()); // Middleware для защиты от XSS (очистка входных данных)

// Подключаем роуты авторизации
app.use("/api/auth", authRoutes);
// Routes - подключение маршрутов API
app.use("/api", apiRoutes);

// Инициализация обработчиков WebSocket соединений
socketHandlers(io); // Обработчики событий WebSocket подключаются к серверу

// Функция для запуска сервера
const start = async () => {
	try {
		await connectDB(); // Подключение к базе данных и создание таблицы, если она не существует
		await sequelize.sync(); // Синхронизация моделей с базой данных

		server.listen(PORT, () => {
			console.log(`Server running on http://${HOST}:${PORT}`); // Логирование успешного запуска сервера
			console.log(
				`Bull Board running on ${process.env.VITE_API_URL}/admin/queues`
			); // Логирование запуска интерфейса Bull
		});
	} catch (err) {
		console.error("Error starting the server:", err); // Логирование ошибки, если сервер не удалось запустить
	}
};
// Вызов функции для старта сервера
start();
