const Redis = require("ioredis"); // Подключение библиотеки ioredis для работы с Redis
require("dotenv").config(); // Загружаем переменные окружения из файла .env

// Подключение к Redis, используя REDIS_URL как приоритетный источник данных
const redisClient = new Redis(process.env.REDIS_URL);

// Устанавливаем обработчик события ошибки, чтобы вывести сообщение в консоль
redisClient.on("error", (err) => {
	console.error("Redis error:", err);
});

// Устанавливаем обработчик события успешного подключения
redisClient.on("connect", () => {
	console.log("Successfully connected to Redis");
});

module.exports = redisClient;
