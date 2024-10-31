import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

// Компонент для страницы входа
const Login = ({ setAuthToken, setIsAuthenticated }) => {
	// Создаем состояния для хранения email, пароля и ошибок
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);
	const navigate = useNavigate(); // Создаем экземпляр навигатора для перехода между страницами

	// Функция для перехода на главную страницу
	const handleHome = () => {
		navigate("/");
	};

	// Функция для перехода на страницу регистрации
	const handleRegister = () => {
		navigate("/register");
	};

	// Функция для перехода на страницу восстановления пароля
	const handleForgotPassword = () => {
		navigate("/forgot-password");
	};

	// Функция для обработки входа через Google
	const handleGoogle = () => {
		window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
	};

	// Функция для обработки отправки формы входа
	const handleSubmit = async (e) => {
		e.preventDefault(); // Предотвращаем отправку формы по умолчанию

		// Проверяем, заполнены ли все поля
		if (!email || !password) {
			setError("Все поля должны быть заполнены");
			return; // Прерываем выполнение функции
		}

		// Отправляем запрос на сервер для входа
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/api/auth/login`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" }, // Заголовки запроса
				body: JSON.stringify({ email, password }), // Тело запроса в формате JSON
			}
		);

		const data = await response.json(); // Получаем ответ от сервера
		if (data.token) {
			localStorage.setItem("token", data.token); // Сохраняем токен в localStorage
			setAuthToken(data.token); // Обновляем состояние токена
			setIsAuthenticated(true);
			navigate("/chat"); // Переходим в чат
		} else {
			setError(data.error || "Ошибка входа");
		}
	};

	// Возвращаем JSX-код для отображения формы входа
	return (
		<>
			<form onSubmit={handleSubmit}>
				{" "}
				{/* Форма для входа */}
				<input
					type='email'
					placeholder='Введите email'
					value={email}
					onChange={(e) => setEmail(e.target.value)} // Обработчик изменения значения поля
				/>
				<input
					type='password'
					placeholder='Введите пароль'
					value={password}
					onChange={(e) => setPassword(e.target.value)} // Обработчик изменения значения поля
				/>
				{error && <p className={styles.error}>{error}</p>}{" "}
				{/* Отображаем сообщение об ошибке, если оно есть */}
				<button type='submit' className={styles.homeBtn}>
					{" "}
					{/* Кнопка для отправки формы */}
					Войти
				</button>
				<button onClick={handleGoogle} className={styles.homeBtn}>
					{" "}
					{/* Кнопка для входа через Google */}
					Продолжить с Google
				</button>
				<button
					type='button'
					className={styles.forgotBtn}
					onClick={handleForgotPassword} // Обработчик клика на кнопку - переход на страницу восстановления пароля
				>
					Забыли пароль?
				</button>
				<div className={styles.buttonContainer}>
					<button onClick={handleRegister} className={styles.homeBtn}>
						{" "}
						{/* Кнопка для регистрации */}
						Регистрация
					</button>
					<button onClick={handleHome} className={styles.homeBtn}>
						Главная
					</button>
				</div>
			</form>
		</>
	);
};

export default Login;
