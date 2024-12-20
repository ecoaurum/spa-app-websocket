const Queue = require("bull"); // Импортируем библиотеку Bull для создания и управления очередями
const Message = require("../models/Message"); // Импортируем модель Message для сохранения сообщений в базе данных
const { sanitizeMessage } = require("../middlewares/sanitize"); // Импортируем функцию sanitizeMessage для очистки текста сообщений

// Подключаем очередь сообщений через REDIS_URL
const messageQueue = new Queue("messageQueue", {
	redis: process.env.REDIS_URL, // подключаем через URL Redis на Railway
	maxRetriesPerRequest: null, // настройка количества повторных попыток
	enableReadyCheck: false, // отключаем проверку готовности
});

// Функция для проверки данных сообщения перед сохранением
const validateMessageData = (data) => {
	if (!data) throw new Error("Message data is undefined"); // Проверяем, что данные сообщения определены
	if (!data.name) throw new Error("Name is required"); // Проверяем, что указано имя
	if (!data.email) throw new Error("Email is required"); // Проверяем, что указан email
	if (!data.text) throw new Error("Text is required"); // Проверяем, что указан текст

	// Возвращаем объект с обязательными и необязательными полями
	return {
		name: data.name,
		email: data.email,
		text: data.text,
		homepage: data.homepage || null, // Опциональное поле
		parentid: data.parentid || null, // Опциональное поле
		quotetext: data.quotetext || null, // Опциональное поле
		imageUrl: data.imageUrl || null, // Опциональное поле
		textFileUrl: data.textFileUrl || null, // Опциональное поле
		timestamp: new Date(), // Устанавливаем текущее время как время создания
	};
};

// Логируем факт инициализации очереди
console.log("Queue initialized with Redis");

// Определяем процесс обработки сообщений в очереди
messageQueue.process(async (job) => {
	try {
		// Валидируем данные
		const validatedData = validateMessageData(job.data);

		// Очищаем текст сообщения от потенциально опасного контента
		const sanitizedText = sanitizeMessage(validatedData.text);
		const sanitizedQuoteText = sanitizeMessage(validatedData.quotetext);

		// Сохраняем сообщение в базу данных
		const newMessage = await Message.create({
			...validatedData,
			text: sanitizedText,
			quotetext: sanitizedQuoteText,
		});

		// console.log("Successfully processed message:", newMessage); // Логирование

		return newMessage; // Возвращаем созданное сообщение как результат задачи
	} catch (error) {
		console.error("Error processing message:", error);
		throw error; // Пробрасываем ошибку для обработки Bull
	}
});

// Экспорт очереди для использования в других частях приложения
module.exports = messageQueue;
