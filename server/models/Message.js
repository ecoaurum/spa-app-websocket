// Импортируем объект DataTypes из Sequelize для определения типов данных в модели
const { DataTypes } = require("sequelize");
// Импортируем объект sequelize для взаимодействия с базой данных
const { sequelize } = require("../config/db");

// Определяем модель Message
const Message = sequelize.define(
	"Message",
	{
		// Поле id — уникальный идентификатор сообщения
		id: {
			type: DataTypes.INTEGER, // Тип данных - целое число
			autoIncrement: true, // Автоматически увеличивается для каждого нового сообщения
			primaryKey: true, // Определяет поле как первичный ключ
		},
		// Поле name — имя пользователя, оставившего сообщение
		name: {
			type: DataTypes.STRING, // Тип данных - строка
			allowNull: false, // Запрещаем оставлять поле пустым
		},
		// Поле email — электронная почта пользователя
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		// Поле homepage — ссылка на сайт пользователя (опционально)
		homepage: {
			type: DataTypes.STRING,
			allowNull: true, // Поле может быть пустым
		},
		// Поле text — текст сообщения
		text: {
			type: DataTypes.TEXT, // Тип данных - текст
			allowNull: false,
		},
		// Поле parentid — идентификатор родительского сообщения (если сообщение является ответом)
		parentid: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		// Поле quotetext — цитируемый текст (опционально)
		quotetext: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		// Поле imageUrl — URL изображения, прикрепленного к сообщению (опционально)
		imageUrl: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		// Поле textFileUrl — URL текстового файла, прикрепленного к сообщению (опционально)
		textFileUrl: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		// Поле timestamp — время создания сообщения
		timestamp: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW, // Устанавливаем текущее время по умолчанию
			allowNull: false,
		},
	},
	{
		tableName: "messages", // Назначаем название таблицы в базе данных
		timestamps: false, // Отключаем поля createdAt и updatedAt
	}
);

// Метод для создания нового сообщения
Message.createMessage = async (messageData) => {
	// Создает новое сообщение и возвращает его ID
	const message = await Message.create(messageData);
	return message.id;
};

// Метод для получения сообщений с пагинацией
Message.getPage = async (page, messagesPerPage) => {
	// Вычисляем смещение для пагинации
	const offset = (page - 1) * messagesPerPage;
	// Извлекаем сообщения, сортируя их по возрастанию времени (ASC)
	return await Message.findAll({
		order: [["timestamp", "ASC"]],
		limit: messagesPerPage,
		offset: offset,
	});
};

// Метод для получения общего количества сообщений
Message.getCount = async () => {
	return await Message.count();
};

// Метод для получения всех сообщений с сортировкой
Message.getAll = async (orderBy = "timestamp", orderDirection = "DESC") => {
	return await Message.findAll({
		order: [[orderBy, orderDirection]],
	});
};

module.exports = Message;
