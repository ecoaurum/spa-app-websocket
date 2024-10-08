const svgCaptcha = require("svg-captcha");

let captchas = {};

exports.generateCaptcha = (req, res) => {
	const captcha = svgCaptcha.create({
		size: 6,
		noise: 2,
		color: true,
		background: "#f0f0f0",
	});
	const ip = req.ip;
	captchas[ip] = captcha.text;

	console.log("Generated CAPTCHA:", captcha.text); // Добавим лог для отладки

	res.type("svg");
	res.status(200).send(captcha.data);
};

exports.validateCaptcha = (ip, inputCaptcha) => {
	console.log("Validating CAPTCHA:", inputCaptcha, "for IP:", ip); // Добавим лог для отладки
	console.log("Stored CAPTCHA:", captchas[ip]);
	return (
		captchas[ip] && captchas[ip].toLowerCase() === inputCaptcha.toLowerCase()
	);
};
