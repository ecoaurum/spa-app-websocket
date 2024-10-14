// Импортируем модель Message для работы с сообщениями в базе данных
const Message = require("../models/Message");

// Импортируем функции для построения дерева сообщений и их очистки от нежелательного содержимого
const { buildMessageTree } = require("../utils/messageTree");
const { sanitizeMessage } = require("../middlewares/sanitize");

const MESSAGES_PER_PAGE = 25; // Количество сообщений на одной странице (пагинация)

// Контроллер для создания нового сообщения с санитизацией текста
exports.createMessage = async (messageData) => {
	// Очищаем текст сообщения и цитату от нежелательного содержимого
	const sanitizedText = sanitizeMessage(messageData.text);
	// Очистка цитируемого текста
	const sanitizedQuoteText = sanitizeMessage(messageData.quotetext || "");

	// Создаем новое сообщение в базе данных
	const newMessageId = await Message.create({
		...messageData,
		text: sanitizedText, // Сохранение очищенного текста
		quotetext: sanitizedQuoteText, // Сохранение очищенного цитируемого текста
	});

	// Возвращаем объект нового сообщения с текущей датой и временем
	return {
		id: newMessageId,
		...messageData,
		text: sanitizedText,
		quotetext: sanitizedQuoteText,
		timestamp: new Date().toISOString(), // Время создания сообщения
	};
};

// Контроллер для добавления сообщения в базу данных (версия для деплоя)
exports.addMessage = async (messageData) => {
	// Очищаем текст сообщения и цитату от нежелательного содержимого
	const sanitizedText = sanitizeMessage(messageData.text);
	const sanitizedQuoteText = sanitizeMessage(messageData.quotetext || "");

	// Создаем новое сообщение в базе данных
	const newMessageId = await Message.create({
		...messageData,
		text: sanitizedText,
		quotetext: sanitizedQuoteText,
	});
	return newMessageId; // Возвращение ID нового сообщения
};

// Контроллер для получения сообщений на определенной странице
exports.getMessagesPage = async (page) => {
	// Получаем сообщения из базы данных для указанной страницы
	const messages = await Message.getPage(page, MESSAGES_PER_PAGE);
	return buildMessageTree(messages); // Возвращение сообщений в виде дерева
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
