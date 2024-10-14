// Импорт модулей для работы с путями файлов и их обработкой
const path = require("path");
const fs = require("fs").promises; // Работа с файловой системой на основе промисов
const sharp = require("sharp"); // Библиотека для обработки изображений

// Функция для загрузки изображения
exports.uploadImage = async (req, res) => {
	// Проверяем, что файл действительно был загружен
	if (!req.file) {
		// Если файл не загружен, отправляем ошибку клиенту
		return res.status(400).send({ message: "No file uploaded" });
	}
	const filePath = req.file.path; // Получаем путь к загруженному файлу
	const resizedFilePath = `uploads/resized_${req.file.filename}`; // Путь для сохранения измененного изображения

	try {
		// Уменьшение изображения с помощью sharp
		await sharp(filePath)
			.resize(320, 240, { fit: sharp.fit.inside, withoutEnlargement: true }) // Задание новых размеров изображения
			.toFile(resizedFilePath); // Сохранение уменьшенного файла

		// Удаление оригинального файла через 1 секунду
		setTimeout(async () => {
			try {
				await fs.access(filePath); // Проверка наличия файла
				await fs.unlink(filePath); // Удаление файла
			} catch (err) {
				console.error("Error deleting file:", err); // Логирование ошибки при удалении файла
			}
		}, 1000);

		// Отправляем клиенту URL измененного изображения
		res.status(200).json({ imageUrl: `/uploads/resized_${req.file.filename}` });
	} catch (error) {
		// Обрабатываем ошибки и отправляем ответ с ошибкой
		console.error("Error processing image:", error);
		res.status(500).json({ message: "Error processing image" });
	}
};

// Функция для загрузки текстовых файлов
exports.uploadFile = async (req, res) => {
	// Проверяем, что файл действительно был загружен
	if (!req.file) {
		// Если файл не загружен, отправляем ошибку клиенту
		return res.status(400).send({ message: "No file uploaded" });
	}

	const filePath = req.file.path; // Путь к загруженному файлу
	const fileSize = req.file.size; // Размер файла

	try {
		// Проверка на размер текстового файла (не более 100KB)
		if (
			path.extname(filePath).toLowerCase() === ".txt" &&
			fileSize > 100 * 1024
		) {
			await fs.unlink(filePath); // Удаляем файл, если размер превышает ограничение
			return res.status(400).json({ message: "Text file exceeds 100KB" }); // Ответ с ошибкой
		}

		console.log("Text file uploaded to:", filePath); // Логирование успешной загрузки
		res.status(200).json({ fileUrl: `/uploads/${req.file.filename}` }); // Отправляем клиенту URL загруженного файла
	} catch (error) {
		// Обрабатываем ошибки и отправляем ответ с ошибкой
		console.error("Error uploading file:", error);
		res.status(500).json({ message: "Error uploading file" });
	}
};
