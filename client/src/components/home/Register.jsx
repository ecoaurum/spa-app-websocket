import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

// Компонент для страницы регистрации
const Register = ({ setAuthToken, setIsAuthenticated }) => {
	// Создаем состояния для хранения имени пользователя, email, пароля и ошибок
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState(null);
	const navigate = useNavigate(); // Создаем экземпляр навигатора для перехода между страницами

	// Функция для перехода на главную страницу
	const handleHome = () => {
		navigate("/");
	};

	// Функция для перехода на страницу входа
	const handleLogin = () => {
		navigate("/login");
	};

	// Функция для обработки входа через Google
	const handleGoogle = () => {
		window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
	};

	// Функция для обработки отправки формы регистрации
	const handleSubmit = async (e) => {
		e.preventDefault(); // Предотвращаем отправку формы по умолчанию

		// Проверяем, заполнены ли все поля
		if (!username || !email || !password || !confirmPassword) {
			setError("Все поля должны быть заполнены");
			return;
		}

		// Проверяем, совпадают ли пароли
		if (password !== confirmPassword) {
			setError("Пароли не совпадают");
			return;
		}

		// Отправляем запрос на сервер для регистрации
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/api/auth/register`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" }, // Заголовки запроса
				body: JSON.stringify({ username, email, password, confirmPassword }), // Тело запроса в формате JSON
			}
		);

		const data = await response.json(); // Получаем ответ от сервера
		if (data.token) {
			localStorage.setItem("token", data.token);
			setAuthToken(data.token);
			setIsAuthenticated(true);
			navigate("/chat");
		} else {
			setError(data.error || "Ошибка регистрации");
		}
	};

	// Возвращаем JSX-код для отображения формы регистрации
	return (
		<>
			<form onSubmit={handleSubmit} className={styles.form}>
				{" "}
				{/* Форма для регистрации */}
				<input
					type='text'
					placeholder='Введите имя'
					value={username}
					onChange={(e) => setUsername(e.target.value)} // Обработчик изменения значения поля
				/>
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
				<input
					type='password'
					placeholder='Подтвердите пароль'
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)} // Обработчик изменения значения поля
					className={styles.input}
				/>
				{error && <p className={styles.error}>{error}</p>}{" "}
				{/* Отображаем сообщение об ошибке, */}
				<button type='submit' className={styles.homeBtn}>
					Зарегистрироваться
				</button>
				<button onClick={handleGoogle} className={styles.homeBtn}>
					Продолжить с Google
				</button>
				<div className={styles.buttonContainer}>
					<button onClick={handleLogin} className={styles.homeBtn}>
						Вход
					</button>
					<button onClick={handleHome} className={styles.homeBtn}>
						Главная
					</button>
				</div>
			</form>
		</>
	);
};

export default Register;
