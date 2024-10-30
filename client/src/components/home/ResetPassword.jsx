import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./styles.module.css";

// Компонент для страницы сброса пароля
const ResetPassword = () => {
	// Создаем состояния для хранения нового пароля, подтверждения пароля и сообщений
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [message, setMessage] = useState(null);
	const { token } = useParams(); // Получаем токен из параметров URL
	const navigate = useNavigate(); // Создаем экземпляр навигатора для перехода между страницами

	// Функция для обработки отправки формы сброса пароля
	const handleSubmit = async (e) => {
		e.preventDefault(); // Предотвращаем отправку формы по умолчанию
		// Проверяем, совпадают ли пароли
		if (password !== confirmPassword) {
			setMessage("Пароли не совпадают");
			return;
		}
		// Отправляем запрос на сервер для сброса пароля
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, // URL для сброса пароля
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json", // Заголовки запроса
				},
				body: JSON.stringify({ token, password }), // Тело запроса в формате JSON
			}
		);
		const data = await response.json(); // Получаем ответ от сервера
		if (data.message) {
			setMessage(data.message); // Устанавливаем сообщение об успешном сбросе пароля
			navigate("/login"); // Перенаправляем на страницу входа
		} else {
			setMessage(data.error || "Ошибка сброса пароля");
		}
	};

	// Возвращаем JSX-код для отображения формы сброса пароля
	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			{" "}
			{/* Форма для сброса пароля */}
			<input
				type='password'
				placeholder='Введите новый пароль'
				value={password}
				onChange={(e) => setPassword(e.target.value)} // Обработчик изменения значения поля
				className={styles.input}
			/>
			<input
				type='password'
				placeholder='Подтвердите новый пароль'
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.target.value)} // Обработчик изменения значения поля
				className={styles.input}
			/>
			{message && <p className={styles.message}>{message}</p>}{" "}
			{/* Отображаем сообщение, если оно есть */}
			<button type='submit' className={styles.homeBtn}>
				{" "}
				{/* Кнопка для отправки формы сброса пароля */}
				Установить новый пароль
			</button>
		</form>
	);
};

export default ResetPassword;
