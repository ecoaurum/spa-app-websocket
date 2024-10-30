const express = require("express");
const router = express.Router();
const { queue, getStatus, clearQueue } = require("../queues/messageQueue"); // Импортируем функции для работы с очередью сообщений

// Маршрут для получения статуса очереди
router.get("/status", async (req, res) => {
	try {
		const status = await getStatus(); // Получаем статус очереди с Redis
		res.json({
			status: "success", // Указываем, что запрос выполнен успешно
			data: status, // Возвращаем данные статуса очереди
			// redis: {
			// 	// Возвращаем информацию о Redis
			// 	host: process.env.REDISHOST,
			// 	port: process.env.REDISPORT,
			// 	password: process.env.REDISPASSWORD,
			// },
			redis: {
				url: process.env.REDIS_URL,
			},
		});
	} catch (error) {
		console.error("Queue status error:", error); // Логируем ошибку при получении статуса
		res.status(500).json({
			status: "error", // Указываем, что произошла ошибка
			message: error.message, // Ответ с сообщением об ошибке
		});
	}
});

// Маршрут для очистки очереди
router.post("/clear", async (req, res) => {
	try {
		await clearQueue(); // Очищаем очередь с помощью функции clearQueue
		res.json({
			status: "success", // Указываем, что запрос выполнен успешно
			message: "Queue cleared", // Сообщение об успешной очистке очереди
		});
	} catch (error) {
		console.error("Queue clear error:", error); // Логируем ошибку при очистке очереди
		res.status(500).json({
			status: "error", // Указываем, что произошла ошибка
			message: error.message, // Ответ с сообщением об ошибке
		});
	}
});

module.exports = router;
