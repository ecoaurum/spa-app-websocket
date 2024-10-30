// Импортируем Sequelize
const { Sequelize } = require("sequelize");
require("dotenv").config(); // Подключение переменных окружения из .env файла

// Создаем подключение к базе данных через Sequelize
const sequelize = new Sequelize(
	process.env.MYSQLDATABASE, // Имя базы данных
	process.env.MYSQLUSER, // Пользователь базы данных
	process.env.MYSQLPASSWORD, // Пароль базы данных
	{
		// Конфигурация подключения к базе данных
		host: process.env.MYSQLHOST || "mysql", // Хост базы данных
		port: process.env.MYSQLPORT || 3306, // Порт базы данных
		dialect: "mysql", // Диалект базы данных
		timezone: "+03:00", // Часовой пояс для корректного времени в базе данных
		logging: false, // Отключаем SQL-запросы в консоли
	}
);

// Проверка подключения к базе данных
const connectDB = async () => {
	try {
		// Установка подключения к базе данных
		await sequelize.authenticate(); // Проверка подключения с помощью метода `authenticate`
		await sequelize.sync({ alter: true }); // Синхронизация моделей с базой данных
		console.log("Соединение с базой данных установлено успешно.");
	} catch (error) {
		console.error("Ошибка подключения к базе данных:", error);
	}
};

module.exports = { sequelize, connectDB };
