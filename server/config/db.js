const mysql = require("mysql2/promise");
require("dotenv").config();

// Подключение к базе данных MySQL
const db = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});

// Функция для создания таблицы, если она не существует
const connectDB = async () => {
	try {
		await db.query(`
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
		console.log("Database connected and table created if not exists");
	} catch (err) {
		console.error("Error connecting to database:", err);
	}
};

module.exports = {
	db,
	connectDB,
};
