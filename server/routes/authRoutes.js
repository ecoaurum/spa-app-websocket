// Импорт необходимых библиотек и модулей
const express = require("express");
const { check } = require("express-validator");
const passport = require("../config/passport-config"); // Импорт конфигурации Passport для аутентификации

// Импорт функций контроллера для обработки логики регистрации, входа и других операций
const {
	register,
	login,
	forgotPassword,
	resetPassword,
	verifyToken,
} = require("../controllers/authController");
const router = express.Router();

// Роут для регистрации
router.post(
	"/register",
	[
		// Проверка имени пользователя
		check("username", "Введите имя пользователя").not().isEmpty(),
		// Проверка адреса электронной почты
		check("email", "Укажите ваш адрес электронной почты").isEmail(),
		// Проверка длины пароля
		check("password", "Пароль должен содержать 6 или более символов").isLength({
			min: 6,
		}),
		// Проверка поля подтверждения пароля
		check("confirmPassword", "Подтвердите пароль").not().isEmpty(),
		// Сравнение подтвержденного пароля с основным паролем
		check("confirmPassword", "Пароли не совпадают").custom(
			(value, { req }) => value === req.body.password
		),
	],
	register // Обработчик маршрута для регистрации
);

// Роут для логина
router.post(
	"/login",
	[
		// Проверка email и пароля при входе
		check("email", "Введите email").isEmail(),
		check("password", "Введите пароль").not().isEmpty(),
	],
	login // Обработчик маршрута для логина
);

// Роут отправки email на востановление пароля
router.post(
	"/forgot-password",
	[
		// Проверка действительности email для отправки на восстановление
		check(
			"email",
			"Пожалуйста, укажите действительный адрес электронной почты."
		).isEmail(),
	],
	forgotPassword // Обработчик маршрута для восстановления пароля
);

// Роут установления нового пароля
router.post(
	"/reset-password",
	[
		// Проверка токена для сброса пароля
		check("token", "Требуется токен").not().isEmpty(),
		// Проверка длины нового пароля
		check(
			"password",
			"Пароль должен состоять из 6 или более символов."
		).isLength({
			min: 6,
		}),
	],
	resetPassword // Обработчик маршрута для сброса пароля
);

// Маршрут для аутентификации через Google
router.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] }) // Запрос данных профиля и email от Google
);

// Обратный вызов Google для обработки результатов аутентификации
router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: `${process.env.CLIENT_URL}/login`, // Перенаправление на страницу входа в систему при неудаче
		session: true, // Использовать сеансы сессии для аутентификации
	}),
	(req, res) => {
		// Проверка, аутентифицирован ли пользователь
		if (req.isAuthenticated()) {
			console.log("Аутентификация Google прошла успешно", req.user); // Лог успешной аутентификации
			req.session.authenticated = true; // Установка флага успеха в сеансе
			res.redirect(`${process.env.CLIENT_URL}/chat`); // Перенаправление на страницу чата
		} else {
			console.log("Аутентификация Google не удалась"); // Лог неудачной аутентификации
			res.redirect(`${process.env.CLIENT_URL}/login`); // Перенаправление на страницу входа
		}
	}
);

// Пример защищенного роута
router.get("/protected", (req, res) => {
	if (req.isAuthenticated()) {
		// Если пользователь аутентифицирован, возвращаем сообщение
		res.json({ message: "Защищенный маршрут" });
	} else {
		res.status(401).json({ error: "Unauthorized" });
	}
});

// Маршрут выхода из системы
router.get("/logout", (req, res) => {
	// Метод logout для завершения сессии
	req.logout((err) => {
		if (err) {
			return next(err); // Обработка ошибок при выходе
		}
		res.redirect("/"); // Перенаправление на главную страницу после выхода
	});
});

module.exports = router;
