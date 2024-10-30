// Импорт необходимых библиотек и модулей
const GoogleStrategy = require("passport-google-oauth20").Strategy; // Импорт Google стратегии для Passport
const passport = require("passport"); // Подключение Passport для аутентификации

// Модель пользователя (настройте под вашу БД)
const User = require("../models/User");

// Сохранение пользователя в сессии
passport.serializeUser((user, done) => {
	done(null, user.id); // Сохранение id пользователя в сессии
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findByPk(id); // Поиск пользователя по id
		done(null, user || null); // Восстановление пользователя из сессии или null, если не найден
	} catch (err) {
		console.error("Ошибка десериализации:", err);
		done(err, null); // Завершение десериализации с ошибкой
	}
});

// Настройка стратегии Google для аутентификации
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID, // Идентификатор клиента Google
			clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Секрет клиента Google
			callbackURL: `${process.env.VITE_API_URL}/api/auth/google/callback`, // URL обратного вызова после авторизации
		},
		// Функция обратного вызова для обработки данных пользователя из Google
		async (accessToken, refreshToken, profile, done) => {
			try {
				let user = await User.findOne({ where: { googleId: profile.id } }); // Поиск пользователя по Google ID
				if (!user) {
					// Создание нового пользователя, если он не найден в базе данных
					user = await User.create({
						googleId: profile.id, // Сохранение Google ID
						email: profile.emails[0].value, // Сохранение email пользователя
						username: profile.displayName || "", // Сохранение имени пользователя или пустая строка
					});
				}
				return done(null, user); // Завершение процесса аутентификации с найденным или созданным пользователем
			} catch (error) {
				return done(error, false);
			}
		}
	)
);

module.exports = passport;
