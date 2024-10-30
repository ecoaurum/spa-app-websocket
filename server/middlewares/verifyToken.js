// Middleware для проверки JWT
const verifyToken = (req, res, next) => {
	// Извлекаем токен из заголовка Authorization, если он есть
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		// Если токен отсутствует, возвращаем ответ с ошибкой 401 (Unauthorized)
		return res.status(401).json({ error: "Токен не предоставлен" });
	}

	// Проверяем подлинность токена с использованием секретного ключа из переменных окружения
	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		// Если токен недействителен, возвращаем ответ с ошибкой 401 (Unauthorized)
		if (err) {
			return res.status(401).json({ error: "Недействительный токен" });
		}

		// Если токен действителен, сохраняем расшифрованные данные пользователя в объект запроса
		req.user = decoded; // сохраняем данные пользователя в запросе
		next(); // продолжаем выполнение запроса
	});
};

module.exports = { verifyToken };
