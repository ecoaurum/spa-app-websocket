// Импорт функции validateCaptcha из контроллера captcha
const { validateCaptcha } = require("../controllers/captchaController");
// Импорт функций для работы с сообщениями
const {
	createMessage,
	getMessagesPage,
	getTotalPages,
} = require("../controllers/messageController");

const messageQueue = require("../queues/messageQueue");

let users = []; // Массив для хранения пользователей, подключенных через WebSocket

// Функция для проверки длины сообщения
function validateMessageLength(text) {
	return text.length > 0 && text.length <= 1000; // Сообщение должно быть не пустым и не длиннее 1000 символов
}

// Функция для проверки формата email
function validateEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Регулярное выражение для проверки email
	return emailRegex.test(email); // Возвращает true, если email корректен
}

// Функция для проверки формата URL
function validateUrl(url) {
	const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/; // Регулярное выражение для проверки URL
	return urlRegex.test(url); // Возвращает true, если URL корректен
}

module.exports = (io) => {
	// Событие при подключении пользователя
	io.on("connect", (socket) => {
		console.log(`${socket.id} user connected`); // Логируем подключение нового пользователя

		// Событие при добавлении нового пользователя
		socket.on("newUser", (data) => {
			const existingUser = users.find((user) => user.socketID === socket.id); // Поиск пользователя с таким же socketID
			if (!existingUser) {
				users.push({ user: data.user, socketID: socket.id }); // Добавление пользователя в массив users
				io.emit("responseNewUser", users); // Отправка обновленного списка пользователей всем клиентам
			}
		});

		// Событие для отправки нового сообщения
		socket.on("message", async (messageData) => {
			try {
				if (!messageData) {
					throw new Error("Данные сообщения отсутствуют");
				}
				const { name, email, text } = messageData;

				// Проверка валидности данных
				if (!name || !email || !validateMessageLength(text)) {
					return socket.emit("error", {
						message: "Заполните все обязательные поля",
					}); // Проверяем обязательные поля
				}

				// Валидация капчи
				if (!validateCaptcha(socket.handshake.address, messageData.captcha)) {
					return socket.emit("error", { message: "Неверная CAPTCHA" }); // Ошибка при неверной капче
				}

				// Валидация email
				if (!validateEmail(email)) {
					return socket.emit("error", {
						message: "Неверный формат электронной почты",
					}); // Ошибка при некорректном email
				}

				// Валидация URL, если он указан
				if (messageData.homepage && !validateUrl(messageData.homepage)) {
					return socket.emit("error", { message: "Неверный формат URL" }); // Ошибка при некорректном URL
				}

				// Добавляем сообщение в очередь для обработки
				const job = await messageQueue.add(messageData, {
					attempts: 3, // Количество попыток при ошибке
					backoff: {
						type: "exponential", // Режим повторного выполнения с экспоненциальной задержкой
						delay: 2000,
					},
				});

				// Ждем завершения задачи
				const result = await job.finished();

				// Логируем успешное завершение задачи
				console.log(
					`Сообщение успешно обработано с идентификатором: ${result.id}`
				);
				console.log("Данные результата:", result);

				// Отправляем обновление всем клиентам
				io.emit("newMessage", { newMessage: result });

				// Обновление первой страницы сообщений
				const updatedFirstPage = await getMessagesPage(1);

				console.log("Updated first page messages:", updatedFirstPage);

				// Отправляем обновленную страницу сообщений
				io.emit("messagesPage", {
					messages: updatedFirstPage, // Сообщения на первой странице
					totalPages: await getTotalPages(), // Общее количество страниц
					currentPage: 1, // Текущая страница
				});
			} catch (err) {
				console.error("Error saving message:", err); // Логирование ошибки
				socket.emit("error", { message: "Error saving message" }); // Ошибка при сохранении сообщения
			}
		});

		// Событие для получения сообщений по странице
		socket.on("getMessages", async (page) => {
			const messagesPage = await getMessagesPage(page); // Получение сообщений для указанной страницы
			// console.log("Sending messagesPage data:", messagesPage);
			// Отправляем страницу сообщений клиенту
			socket.emit("messagesPage", {
				messages: messagesPage, // Сообщения для текущей страницы
				totalPages: await getTotalPages(), // Общее количество страниц
				currentPage: page, // Текущая страница
			});
		});

		// Событие выхода пользователя
		socket.on("logout", ({ user, socketID }) => {
			users = users.filter((u) => u.socketID !== socketID); // Удаление пользователя из списка
			io.emit("responseNewUser", users); // Отправка обновленного списка пользователей всем клиентам
			console.log(`${user} (${socketID}) has left the chat`); // Логируем выход пользователя
		});

		// Событие при отключении пользователя
		socket.on("disconnect", () => {
			users = users.filter((u) => u.socketID !== socket.id); // Удаляем пользователя из массива users
			io.emit("responseNewUser", users); // Отправляем обновленный список пользователей всем клиентам
			console.log(`${socket.id} disconnected`); // Логируем отключение пользователя
		});
	});
};
