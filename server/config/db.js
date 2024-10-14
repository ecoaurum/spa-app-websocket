// Импорт модуля mysql2 для работы с MySQL
const mysql = require("mysql2/promise");
require("dotenv").config(); // Подключение переменных окружения из .env файла

// Подключение к базе данных MySQL
const db = mysql.createPool({
	host: process.env.MYSQLHOST || "mysql", // Хост базы данных
	user: process.env.MYSQLUSER, // Имя пользователя базы данных
	password: process.env.MYSQLPASSWORD, // Пароль для подключения к базе данных
	database: process.env.MYSQLDATABASE, // Имя базы данных
	port: process.env.MYSQLPORT || 3306, // Порт для подключения к базе данных (по умолчанию 3306)
});

// Функция для проверки и создания таблицы сообщений, если она не существует
const connectDB = async () => {
	try {
		const connection = await db.getConnection(); // Создание соединения с базой данных
		// SQL-запрос для создания таблицы
		await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        homepage VARCHAR(255),
        text TEXT NOT NULL,
        parentid INT,
        quotetext TEXT,
        imageUrl VARCHAR(255),
        textFileUrl VARCHAR(255),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
		console.log("Database connected and table created if not exists"); // Логирование успешного подключения к базе данных и создания таблицы
		connection.release(); // Освобождение соединения
	} catch (err) {
		console.error("Error connecting to database:", err); // Лог ошибки подключения
	}
};

module.exports = { db, connectDB };
