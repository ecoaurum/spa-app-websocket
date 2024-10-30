const jwt = require("jsonwebtoken");
// Импортируем validationResult для проверки результатов валидации из express-validator
const { validationResult } = require("express-validator");
// Подключение библиотеки nodemailer для отправки email
const nodemailer = require("nodemailer");
// Подключение библиотеки bcrypt для хеширования паролей
const bcrypt = require("bcryptjs");
// Импорт функции randomBytes из модуля crypto для генерации случайных данных
const { randomBytes } = require("node:crypto");
// Импорт модели пользователя
const User = require("../models/User");

// Настройка транспортера для отправки email через Gmail SMTP-сервер
const transporter = nodemailer.createTransport({
	service: "gmail", // Выбор сервиса Gmail
	host: "smtp.gmail.com", // Указываем хост SMTP сервера Gmail
	port: 465, // Указываем порт для подключения по SSL
	secure: true, // Указываем, что используем защищенное соединение
	// Указываем данные аутентификации из переменных окружения
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

// Восстановление пароля
const forgotPassword = async (req, res) => {
	// Проверка валидации запроса
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		// Возвращаем ошибку, если валидация не прошла
		return res.status(400).json({ errors: errors.array() });
	}

	// Извлекаем email из тела запроса
	const { email } = req.body;

	try {
		// Проверка, существует ли пользователь с указанным email
		const user = await User.findByEmail(email);
		if (!user) {
			return res.status(400).json({
				error: "Пользователь с таким адресом электронной почты не существует",
			});
		}

		const token = randomBytes(20).toString("hex"); // Генерация токена для сброса пароля
		const expirationTime = Date.now() + 3600000; // Задаем срок действия токена (1 час)
		await User.setResetToken(email, token, expirationTime); // Сохраняем токен и время истечения в базе данных

		// Настройка параметров письма
		const mailOptions = {
			from: `"Websocket chat" <${process.env.EMAIL_USER}>`, // Отправитель
			to: user.email, // Получатель
			subject: "Восстановление пароля", // Тема письма
			// Текст сообщения с ссылкой для сброса пароля
			text: `Вы получили это письмо, потому что вы (или кто-то другой) запросили сброс пароля для своей учетной записи.\n\n
      Нажмите на следующую ссылку или вставьте ее в адресную строку браузера, чтобы завершить процесс:\n\n
      ${process.env.CLIENT_URL}/reset/${token}\n\n
      Если вы этого не запрашивали, проигнорируйте это письмо, и ваш пароль останется неизменным.\n`,
		};

		// Отправляем email
		await transporter.sendMail(mailOptions);
		res.status(200).json({ message: "Электронное письмо отправлено" });
	} catch (err) {
		console.error(err); // Логирование ошибки
		res.status(500).json({ error: "Ошибка при отправке письма" });
	}
};

// Сброс пароля
const resetPassword = async (req, res) => {
	// Проверка валидации запроса
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	// Извлекаем токен и новый пароль из тела запроса
	const { token, password } = req.body;

	try {
		// Проверка действительности токена
		const user = await User.findByResetToken(token);
		if (!user || user.resetPasswordExpires < Date.now()) {
			return res.status(400).json({
				error: "Токен сброса пароля недействителен или истек срок его действия",
			});
		}

		// Хешируем новый пароль
		const hashedPassword = await bcrypt.hash(password, 10);
		// Обновляем пароль пользователя в базе данных
		await User.updatePassword(user.email, hashedPassword);

		res.status(200).json({ message: "Пароль обновлен" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Ошибка сброса пароля" });
	}
};

// Регистрация пользователя
const register = async (req, res) => {
	// Проверка валидации запроса
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	// Извлекаем данные пользователя из тела запроса
	const { username, email, password, confirmPassword } = req.body;

	// Проверяем, что пароли совпадают
	if (password !== confirmPassword) {
		return res.status(400).json({ error: "Пароли не совпадают" });
	}

	try {
		// Проверяем, существует ли пользователь с таким email
		const existingUser = await User.findByEmail(email);
		if (existingUser) {
			return res
				.status(400)
				.json({ error: "Электронная почта уже используется" });
		}

		// Создаем нового пользователя и сохраняем его в базе данных
		const userId = await User.createUser({ username, email, password });
		res.status(201).json({ message: "Пользователь создан", userId });
	} catch (err) {
		res.status(500).json({ error: "Ошибка регистрации пользователя" });
	}
};

// Логин пользователя
const login = async (req, res) => {
	// Проверка валидации запроса
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	// Извлекаем email и пароль из тела запроса
	const { email, password } = req.body;

	try {
		// Ищем пользователя по email
		const user = await User.findByEmail(email);

		if (!user) {
			console.log("Пользователь не найден"); // Логирование ошибки
			return res
				.status(401)
				.json({ error: "Неверный адрес электронной почты или пароль" });
		}

		// Проверяем правильность пароля
		const isPasswordValid = await User.checkPassword(password, user.password);

		if (!isPasswordValid) {
			return res
				.status(401)
				.json({ error: "Неверный адрес электронной почты или пароль" });
		}

		// Генерация JWT
		const token = jwt.sign(
			{ id: user.id, username: user.username }, // Данные пользователя, которые будут включены в токен
			process.env.JWT_SECRET, // Секретный ключ для подписи токена
			{
				expiresIn: "1h", // Срок действия токена
			}
		);

		// Отправляем токен в ответе
		res.json({ token });
	} catch (err) {
		console.error("Ошибка при входе в систему:", err);
		res.status(500).json({ error: "Ошибка входа в систему" });
	}
};

// Проверка JWT токена
const verifyToken = (req, res, next) => {
	// Извлекаем токен из заголовка авторизации
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return res.status(401).json({ error: "Токен не предоставлен" });
	}

	// Проверяем подлинность токена
	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(401).json({ error: "Недействительный токен" });
		}

		// Добавляем расшифрованные данные токена в объект запроса
		req.user = decoded;
		next();
	});
};

module.exports = {
	register,
	login,
	verifyToken,
	forgotPassword,
	resetPassword,
};
