// Импортируем модель Message для работы с сообщениями в базе данных
const Message = require("../models/Message");
// Импортируем Redis очередь сообщений
const messageQueue = require("../queues/messageQueue");

// Импортируем функции для построения дерева сообщений и их очистки от нежелательного содержимого
const { buildMessageTree } = require("../utils/messageTree");

const MESSAGES_PER_PAGE = 25; // Количество сообщений на одной странице (пагинация)

// Контроллер для добавления сообщения в очередь Redis
exports.createMessage = async (req, res) => {
	try {
		// Проверяем наличие обязательных полей
		const { name, email, text, parentid } = req.body;

		// Проверяем, что все обязательные поля заполнены
		if (!name || !email || !text) {
			return res.status(400).json({
				error: "Missing required fields", // Возвращаем ошибку, если поля отсутствуют
				details: {
					name: !name ? "Name is required" : null, // Указываем, что имя обязательно
					email: !email ? "Email is required" : null, // Указываем, что email обязателен
					text: !text ? "Text is required" : null, // Указываем, что текст сообщения обязателен
				},
			});
		}

		let quotetext = req.body.quotetext || null; // Получаем текст для цитирования, если он есть

		// Если есть parentid, получаем текст родительского сообщения
		if (parentid) {
			const parentMessage = await Message.findByPk(parentid); // Находим родительское сообщение по ID
			if (parentMessage) {
				// Обрезаем текст до нужной длины (например, до 100 символов)
				quotetext = parentMessage.text.slice(0, 100); // Устанавливаем текст цитаты
			}
		}

		// Добавляем сообщение в очередь
		const job = await messageQueue.add(
			{ ...req.body, quotetext }, // Добавляем quotetext в job данные
			{
				attempts: 3, // Количество попыток добавления задачи в очередь
				backoff: {
					// Настройки для повторных попыток
					type: "exponential", // Экспоненциальная задержка между попытками
					delay: 2000, // Задержка в 2 секунды
				},
			}
		);

		// Возвращаем успешный ответ с ID задачи
		res.status(202).json({
			message: "Сообщение успешно поставлено в очередь",
			jobId: job.id, // ID задачи в очереди
		});
	} catch (error) {
		console.error("Ошибка обработки сообщения:", error); // Логируем ошибку
		res.status(500).json({
			error: "Ошибка обработки сообщения", // Возвращаем ошибку клиенту
			details: error.message, // Возвращаем детали ошибки
		});
	}
};

// Контроллер для получения статуса сообщения
exports.getMessageStatus = async (req, res) => {
	try {
		const { jobId } = req.params; // Получаем ID задачи из параметров запроса
		const job = await messageQueue.getJob(jobId); // Получаем задачу по ID

		if (!job) {
			return res.status(404).json({ error: "Job not found" }); // Возвращаем ошибку, если задача не найдена
		}

		const state = await job.getState(); // Получаем состояние задачи
		const result = job.returnvalue; // Получаем результат выполнения задачи

		// Возвращаем статус задачи
		res.json({
			jobId,
			state, // Состояние задачи
			result, // Результат выполнения
		});
	} catch (error) {
		res.status(500).json({
			error: "Failed to get job status", // Возвращаем ошибку клиенту
			details: error.message, // Возвращаем детали ошибки
		});
	}
};

// Преобразование сообщения и его вложенных ответов в простой объект
function serializeMessages(messages) {
	return messages.map((msg) => {
		return {
			...msg.dataValues, // Извлекаем основные данные сообщения
			replies: msg.replies ? serializeMessages(msg.replies) : [], // Рекурсивно обрабатываем вложенные ответы
		};
	});
}

// Контроллер для получения сообщений на определенной странице
exports.getMessagesPage = async (page) => {
	const messages = await Message.getPage(page, MESSAGES_PER_PAGE); // Получаем сообщения для указанной страницы
	const messageTree = buildMessageTree(messages); // Построение дерева сообщений из полученных данных
	const serializedTree = serializeMessages(messageTree); // Преобразование дерева в простой объект для отправки клиенту

	return serializedTree; // Возвращаем сериализованное дерево сообщений
};

// Контроллер для получения общего числа страниц
exports.getTotalPages = async () => {
	const totalMessages = await Message.getCount(); // Получение общего количества сообщений
	return Math.ceil(totalMessages / MESSAGES_PER_PAGE); // Вычисление количества страниц
};

// Контроллер для получения всех сообщений с возможностью сортировки
exports.getMainComments = async (sort, order) => {
	let orderBy = "timestamp"; // По умолчанию сортировка по времени
	if (sort === "username") orderBy = "name"; // Сортировка по имени пользователя
	else if (sort === "email") orderBy = "email"; // Сортировка по email
	else if (sort === "date") orderBy = "timestamp"; // Сортировка по дате

	const orderDirection = order === "asc" ? "ASC" : "DESC"; // Направление сортировки (по возрастанию или убыванию)
	const allMessages = await Message.getAll(orderBy, orderDirection); // Получаем все сообщения из базы данных с заданной сортировкой
	return buildMessageTree(allMessages); // Возвращение сообщений в виде дерева
};
