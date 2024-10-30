import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

// Компонент главной страницы
const Home = () => {
	const navigate = useNavigate(); // Создаем экземпляр навигатора для перехода между страницами

	// Функция для обработки нажатия на кнопку "Вход"
	const handleLogin = () => {
		navigate("/login");
	};

	// Функция для обработки нажатия на кнопку "Регистрация"
	const handleRegister = () => {
		navigate("/register");
	};

	// Возвращаем JSX-код для отображения главной страницы
	return (
		<div className={styles.container}>
			<h2>Добро пожаловать в чат</h2>
			<div className={styles.buttons}>
				<button onClick={handleLogin} className={styles.homeBtn}>
					{" "}
					{/* Кнопка для входа */}
					Вход
				</button>
				<button onClick={handleRegister} className={styles.homeBtn}>
					{" "}
					{/* Кнопка для регистрации */}
					Регистрация
				</button>
			</div>
		</div>
	);
};
export default Home;
