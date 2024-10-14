// Импорт библиотеки для санитизации HTML
const sanitizeHtml = require("sanitize-html");

// Опции для очистки текста
const sanitizeOptions = {
	allowedTags: ["a", "code", "i", "strong"], // Разрешённые теги
	allowedAttributes: {
		a: ["href", "title"], // Разрешённые атрибуты для тегов <a>
	},
	allowedSchemes: ["http", "https"], // Разрешённые схемы для ссылок - разрешены только http и https
};

// Функция для очистки сообщений от вредоносного HTML
function sanitizeMessage(text) {
	return sanitizeHtml(text, sanitizeOptions); // Возвращает очищенный текст
}

module.exports = { sanitizeMessage }; // Экспорт функции
