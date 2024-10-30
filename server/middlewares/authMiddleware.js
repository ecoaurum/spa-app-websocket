// Middleware-функция для проверки аутентификации пользователя
const isAuthenticated = (req, res, next) => {
	console.log("Session:", req.session); // Вывод информации о текущей сессии в консоль
	console.log("User:", req.user); // Вывод информации о текущем пользователе в консоль
	console.log("isAuthenticated:", req.isAuthenticated()); // Проверка аутентификации пользователя и вывод результата в консоль

	// Если пользователь аутентифицирован, передаем управление следующей функции в цепочке
	if (req.isAuthenticated()) {
		return next();
	}
	// Если пользователь не аутентифицирован, возвращаем статус 401 и сообщение об ошибке
	res.status(401).json({ message: "Unauthorized" });
};

module.exports = { isAuthenticated };
