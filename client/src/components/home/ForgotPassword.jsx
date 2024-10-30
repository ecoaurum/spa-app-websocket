import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

// Компонент для сброса пароля
const ForgotPassword = () => {
	// Создаем состояние для хранения email и сообщения
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState(null);
	const navigate = useNavigate(); // Создаем экземпляр навигатора для перехода между страницами

	// Функция для отправки формы сброса пароля
	const handleSubmit = async (e) => {
		e.preventDefault(); // Предотвращаем отправку формы по умолчанию
		// Отправляем запрос на сброс пароля на сервер
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json", // Тип контента запроса
				},
				body: JSON.stringify({ email }), // Тело запроса в формате JSON
			}
		);

		// Получаем ответ от сервера
		const data = await response.json();
		// Обрабатываем ответ от сервера
		if (data.message) {
			setMessage(data.message); // Если есть сообщение, то отображаем его
		} else {
			setMessage(data.error || "Ошибка при отправке письма");
		}
	};

	// Возвращаем JSX-код для отображения формы сброса пароля
	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			<input
				type='email'
				placeholder='Введите email для сброса пароля'
				value={email}
				onChange={(e) => setEmail(e.target.value)} // Обработчик изменения значения поля
				className={styles.input}
			/>
			{/* Отображаем сообщение, если оно есть */}
			{message && <p className={styles.message}>{message}</p>}
			<button type='submit' className={styles.homeBtn}>
				Отправить
			</button>
			<button
				type='button'
				className={styles.homeBtn}
				onClick={() => navigate("/login")} // Обработчик клика на кнопку - переход на страницу логина
			>
				Назад
			</button>
		</form>
	);
};

export default ForgotPassword;
