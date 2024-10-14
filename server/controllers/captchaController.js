// Импорт библиотеки для генерации капчи
const svgCaptcha = require("svg-captcha");

let captchas = {}; // Объект для хранения сгенерированных капч по IP-адресам

// Функция для генерации новой CAPTCHA
exports.generateCaptcha = (req, res) => {
	// Создаем новую CAPTCHA с заданными параметрами
	const captcha = svgCaptcha.create({
		size: 6, // Длина текста CAPTCHA
		noise: 2, // Количество шума (линий) на изображении
		color: true, // Цветной текст
		background: "#f0f0f0", // Цвет фона изображения
	});

	const ip = req.ip; // Получаем IP-адрес пользователя из запроса
	captchas[ip] = captcha.text; // Сохраняем текст CAPTCHA для данного IP-адреса

	console.log("Generated CAPTCHA:", captcha.text); // Логирование капчи для отладки

	// Устанавливаем тип ответа как SVG изображение и отправляем его клиенту
	res.type("svg");
	res.status(200).send(captcha.data);
};

// Функция для валидации введенной пользователем CAPTCHA
exports.validateCaptcha = (ip, inputCaptcha) => {
	// Логируем введенное пользователем значение CAPTCHA и IP для отладки
	console.log("Validating CAPTCHA:", inputCaptcha, "for IP:", ip);
	// Логируем сохраненную CAPTCHA для данного IP для отладки
	console.log("Stored CAPTCHA:", captchas[ip]);
	return (
		// Сравниваем введенное значение CAPTCHA с сохраненным, игнорируя регистр
		captchas[ip] && captchas[ip].toLowerCase() === inputCaptcha.toLowerCase()
	);
};
