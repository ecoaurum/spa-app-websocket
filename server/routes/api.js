// Импорт основных модулей
const express = require("express");
const router = express.Router(); // Router для управления маршрутами
const multer = require("multer"); // Multer для загрузки файлов
const path = require("path"); // Модуль для работы с путями файлов
const fs = require("fs"); // Файловая система для работы с файлами (создание папок, удаление файлов)

const { generateCaptcha } = require("../controllers/captchaController"); // Контроллер для генерации капчи
const { uploadImage, uploadFile } = require("../controllers/fileController"); // Контроллер для загрузки изображений и файлов
const {
	getMainComments,
	addMessage,
} = require("../controllers/messageController"); // Контроллеры для работы с сообщениями

// Конфигурация хранилища для multer (для загрузки файлов)
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// Определение директории для загрузки
		const dir = "./uploads"; // Папка для загрузки
		if (!fs.existsSync(dir)) {
			// Если директория не существует
			fs.mkdirSync(dir); // Создаём папку, если она не существует
		}
		cb(null, "uploads/"); // Указать директорию для загрузки файлов
	},
	filename: function (req, file, cb) {
		// Генерация уникального имени файла с текущим временем и расширением исходного файла
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

// Настройка multer для фильтрации файлов по типам и размерам
const upload = multer({
	storage: storage,
	fileFilter: function (req, file, cb) {
		// Проверка допустимых типов файлов
		const filetypes = /jpeg|jpg|png|gif|txt/; // Допустимые расширения файлов
		const extname = filetypes.test(
			path.extname(file.originalname).toLowerCase() // Проверка расширения файла
		);
		const mimetype = file.mimetype; // MIME тип файла

		// Если расширение и MIME тип соответствуют допустимым
		if (extname && mimetype) {
			// Если это текстовый файл, проверка на размер (не больше 100KB)
			if (mimetype === "text/plain") {
				if (file.size > 100 * 1024) {
					return cb(new Error("Text file exceeds 100KB")); // Ошибка при превышении размера
				}
			} else if (/image\/(jpeg|png|gif)/.test(mimetype)) {
				// Проверка размера изображения
				if (file.size > 1 * 1024 * 1024) {
					return cb(new Error("Image file exceeds 1MB")); // Ограничение по размеру для изображений
				}
			}
			return cb(null, true); // Файл допустим для загрузки
		}
		cb(new Error("Invalid file type. Only images and text files are allowed.")); // Недопустимый тип файла
	},
});

// Маршрут для генерации капчи
router.get("/captcha", generateCaptcha); // Вызов функции генерации капчи

// Маршрут для загрузки изображения
router.post("/upload-image", upload.single("image"), uploadImage); // Обработка одного загружаемого изображения с помощью multer

// Маршрут для загрузки файлов
router.post("/upload-file", upload.single("file"), uploadFile); // Обработка одного файла с помощью multer

// Маршрут для получения главных комментариев с сортировкой
router.get("/main-comments", async (req, res) => {
	try {
		const { sort, order } = req.query; // Получение параметров сортировки из запроса
		const comments = await getMainComments(sort, order); // Получение комментариев с контроллера. Вызов функции для получения комментариев
		res.json(comments); // Ответ с комментариями в формате JSON
	} catch (error) {
		console.error("Error getting comments:", error); // Логирование ошибки
		res.status(500).json({ error: "Internal server error" }); // Ответ на ошибку сервера
	}
});

// Маршрут для добавления нового сообщения
router.post("/messages", async (req, res) => {
	const {
		name,
		email,
		homepage,
		text,
		parentId,
		quotetext,
		imageUrl,
		textFileUrl,
	} = req.body; // Извлечение данных из тела запроса

	try {
		// Вызов функции для добавления нового сообщения
		const messageId = await addMessage({
			name,
			email,
			homepage,
			text,
			parentId,
			quotetext,
			imageUrl,
			textFileUrl,
		});

		res.status(201).json({ message: "Message added successfully", messageId }); // Ответ с подтверждением успешного добавления
	} catch (err) {
		console.error("Error inserting message:", err); // Логирование ошибки
		res.status(500).json({ error: "Failed to add message" }); // Ответ на ошибку при добавлении сообщения
	}
});

// Экспорт маршрутов для использования в основном приложении
module.exports = router;
