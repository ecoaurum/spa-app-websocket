const Redis = require("ioredis"); // Подключение библиотеки ioredis для работы с Redis
require("dotenv").config(); // Загружаем переменные окружения из файла .env

// Создаем клиент Redis с конфигурацией подключения
// const redisClient = new Redis(
// 	process.env.REDIS_URL || {
// 		// Указываем хост для Redis из переменной окружения
// 		host: process.env.REDISHOST,
// 		// Указываем порт для Redis из переменной окружения, по умолчанию 6379
// 		port: process.env.REDISPORT,
// 		password: process.env.REDISPASSWORD,
// 	}
// );

// Подключение к Redis, используя REDIS_URL как приоритетный источник данных
const redisClient = new Redis(process.env.REDIS_URL, {
	maxRetriesPerRequest: 3,
	connectTimeout: 10000,
});

// Устанавливаем обработчик события ошибки, чтобы вывести сообщение в консоль
redisClient.on("error", (err) => {
	console.error("Redis error:", err);
});

// Устанавливаем обработчик события успешного подключения
redisClient.on("connect", () => {
	console.log("Successfully connected to Redis");
});

module.exports = redisClient;
