// const mysql = require("mysql2/promise");
// require("dotenv").config();

// // Подключение к базе данных MySQL
// const db = mysql.createPool({
// 	host: process.env.MYSQL_HOST || "mysql",
// 	user: "root",
// 	password: "Kd73PkjwqPSeZQaTA",
// 	database: "chat_socket",
// });

// // Функция для создания таблицы, если она не существует
// const connectDB = async () => {
// 	try {
// 		await db.query(`
//         CREATE TABLE IF NOT EXISTS messages (
//           id INT AUTO_INCREMENT PRIMARY KEY,
//           name VARCHAR(255) NOT NULL,
//           email VARCHAR(255) NOT NULL,
//           homepage VARCHAR(255),
//           text TEXT NOT NULL,
//           parentid INT,
//           quotetext TEXT,
//           imageUrl VARCHAR(255),
//           textFileUrl VARCHAR(255),
//           timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
//         )
//       `);

// 		const [rows] = await connectDB.execute("SELECT * FROM messages");
// 		console.log(rows);
// 		console.log("Database connected and table created if not exists");
// 	} catch (err) {
// 		console.error("Error connecting to database:", err);
// 	}
// };

// module.exports = {
// 	db,
// 	connectDB,
// };

const mysql = require("mysql2/promise");
require("dotenv").config();

// Подключение к базе данных MySQL
const db = mysql.createPool({
	host: process.env.MYSQL_HOST || "mysql",
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE,
});

// Функция для создания таблицы, если она не существует
const connectDB = async () => {
	try {
		const connection = await db.getConnection(); // Создание соединения
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
		const [rows] = await connection.query("SELECT * FROM messages"); // Получение данных из таблицы
		console.log(rows);
		console.log("Database connected and table created if not exists");
		connection.release(); // Освобождение соединения
	} catch (err) {
		console.error("Error connecting to database:", err);
	}
};

module.exports = { db, connectDB };
