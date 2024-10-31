// Импортируем объект DataTypes из Sequelize для указания типов данных в модели
const { DataTypes } = require("sequelize");
// Импортируем объект sequelize для соединения с базой данных
const { sequelize } = require("../config/db");
// Импортируем bcrypt для хеширования паролей
const bcrypt = require("bcryptjs");

// Определяем модель User для хранения информации о пользователях
const User = sequelize.define(
	"User",
	{
		// Поле id — уникальный идентификатор пользователя
		id: {
			type: DataTypes.INTEGER, // Тип данных - целое число
			autoIncrement: true, // Автоматически увеличивается с каждым новым пользователем
			primaryKey: true, // Устанавливаем поле как первичный ключ
		},
		// Поле username — имя пользователя
		username: {
			type: DataTypes.STRING,
			allowNull: true, // Может быть пустым
		},
		// Поле email — адрес электронной почты пользователя
		email: {
			type: DataTypes.STRING,
			allowNull: false, // Обязательное поле
			unique: true, // Должно быть уникальным
		},
		// Поле password — хешированный пароль пользователя
		password: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		// Поле googleId — идентификатор Google для авторизации через Google
		googleId: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true, // Должно быть уникальным
		},
		// Поле resetPasswordToken — токен для сброса пароля
		resetPasswordToken: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		// Поле resetPasswordExpires — время истечения токена для сброса пароля
		resetPasswordExpires: {
			type: DataTypes.BIGINT,
			allowNull: true,
		},
		// Поле timestamp — время создания пользователя
		timestamp: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW, // Устанавливаем текущее время по умолчанию
			allowNull: false,
		},
	},
	{
		tableName: "users", // Явно указываем название таблицы без пробелов
	}
);

// Статические методы для работы с пользователем

// Хеширование пароля перед сохранением нового пользователя
User.beforeCreate(async (user) => {
	if (user.password) {
		console.log("Hashing password before create");
		user.password = await bcrypt.hash(user.password, 10);
	}
});

// Хеширование пароля перед обновлением, если он изменился
User.beforeUpdate(async (user) => {
	if (user.changed("password")) {
		console.log("Hashing password before update");
		user.password = await bcrypt.hash(user.password, 10);
	}
});

// Метод для создания нового пользователя
User.createUser = async function (userData) {
	const user = await this.create(userData);
	return user.id;
};

// Метод для поиска пользователя по email
User.findByEmail = async function (email) {
	return await this.findOne({ where: { email } });
};

// Метод для поиска пользователя по ID
User.findById = async function (id) {
	return await User.findOne({ where: { id } });
};

// Метод для поиска пользователя по Google ID
User.findByGoogleId = async function (googleId) {
	return await this.findOne({ where: { googleId } });
};

// Метод для проверки пароля
User.checkPassword = async function (inputPassword, storedPassword) {
	// Сравнивает введенный пароль с сохраненным хешированным паролем
	return await bcrypt.compare(inputPassword, storedPassword);
};

// Метод для установки токена сброса пароля
User.setResetToken = async function (email, token, expirationTime) {
	await this.update(
		{ resetPasswordToken: token, resetPasswordExpires: expirationTime },
		{ where: { email } }
	);
};

// Метод для поиска пользователя по токену сброса пароля
User.findByResetToken = async function (token) {
	return await this.findOne({ where: { resetPasswordToken: token } });
};

// Метод для обновления пароля пользователя и сброса токена
User.updatePassword = async function (email, newPassword) {
	await this.update(
		{
			password: newPassword,
			resetPasswordToken: null, // Сбрасываем токен сброса пароля
			resetPasswordExpires: null, // Сбрасываем время истечения токена
		},
		{ where: { email } }
	);
};

module.exports = User;
