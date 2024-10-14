// Импорт базы данных
const { db } = require("../config/db");

// Определяем класс Message, который будет использоваться для взаимодействия с таблицей сообщений в базе данных
class Message {
	// Метод для создания нового сообщения
	static async create(messageData) {
		// Выполняем SQL-запрос для вставки нового сообщения в таблицу
		const [result] = await db.query(
			`INSERT INTO messages (name, email, homepage, text, parentid, quotetext, imageUrl, textFileUrl) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				messageData.name, // Имя пользователя
				messageData.email, // Электронная почта
				messageData.homepage || null, // Домашняя страница (если есть)
				messageData.text, // Текст сообщения
				messageData.parentId || null, // ID родительского сообщения (если есть)
				messageData.quotetext || null, // Цитируемый текст (если есть)
				messageData.imageUrl || null, // URL изображения (если есть)
				messageData.textFileUrl || null, // URL текстового файла (если есть)
			]
		);
		return result.insertId; // Возвращение ID нового сообщения
	}

	// Статический метод для получения страницы с сообщениями
	static async getPage(page, messagesPerPage) {
		const offset = (page - 1) * messagesPerPage; // Вычисляем смещение для пагинации
		// Выполняем SQL-запрос для получения сообщений с учетом пагинации
		const [messages] = await db.query(
			"SELECT * FROM messages ORDER BY timestamp ASC LIMIT ? OFFSET ?",
			[messagesPerPage, offset] // Параметры запроса: лимит и смещени
		);
		return messages; // Возвращаем полученные сообщения
	}

	// Статический метод для получения общего количества сообщений
	static async getCount() {
		// Выполняем SQL-запрос для подсчета общего количества сообщений
		const [rows] = await db.query("SELECT COUNT(*) AS count FROM messages");
		return rows[0].count; // Возвращение количества сообщений
	}

	// Статический метод для получения всех сообщений с возможностью сортировки
	static async getAll(orderBy = "timestamp", orderDirection = "DESC") {
		// Выполняем SQL-запрос для получения всех сообщений с указанным порядком сортировки
		const [messages] = await db.query(
			`SELECT * FROM messages ORDER BY ${orderBy} ${orderDirection}`
		);
		return messages; // Возвращаем полученные сообщения
	}
}

module.exports = Message; // Экспорт класса
