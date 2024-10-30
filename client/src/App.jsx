import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socketIO from "socket.io-client"; // Подключение к серверу WebSocket
import Home from "./components/home/home.jsx"; // Главная страница
import ChatPage from "./components/chat/index.jsx"; // Страница чата
import Login from "./components/home/Login.jsx"; // Страница входа
import Register from "./components/home/Register.jsx"; // Страница регистрации
import ForgotPassword from "./components/home/ForgotPassword.jsx"; // Страница восстановления пароля
import ResetPassword from "./components/home/ResetPassword.jsx"; // Страница сброса пароля
import ProtectedRoute from "./components/protected/ProtectedRoute"; // Добавляем защищенный маршрут

// Создаем WebSocket подключение с использованием URL, указанного в переменной окружения
const socket = socketIO.connect(import.meta.env.VITE_API_URL);

function App() {
	const [authToken, setAuthToken] = useState(null); // Хранение токена аутентификации
	const [isLoading, setIsLoading] = useState(true); // Отслеживание состояния загрузки
	const [isAuthenticated, setIsAuthenticated] = useState(false); // Статус аутентификации пользователя
	const navigate = useNavigate(); // Хук для навигации

	// Проверка аутентификации при первой загрузке
	useEffect(() => {
		const checkAuthentication = async () => {
			try {
				// Запрос на защищенный маршрут для проверки статуса аутентификации
				const response = await fetch("/api/protected"); // Проверить статус аутентификации
				if (response.ok) {
					setIsAuthenticated(true); // Установка флага аутентификации, если запрос успешен
				} else {
					setIsAuthenticated(false); // Сбрасываем флаг, если запрос не успешен
				}
			} catch (error) {
				console.error("Error checking authentication:", error);
				setIsAuthenticated(false);
			} finally {
				setIsLoading(false); // Установка состояния загрузки на false
			}
		};

		checkAuthentication(); // Вызов функции проверки аутентификации
	}, []);

	// Проверка токена в localStorage при загрузке приложения
	useEffect(() => {
		const token = localStorage.getItem("token"); // Извлечение токена из localStorage
		if (token) {
			setAuthToken(token); // Установка токена, если он найден
		}
		setIsLoading(false); // Установка состояния загрузки на false
	}, []);

	// Рендеринг индикатора загрузки, пока не завершена проверка
	if (isLoading) {
		return <div>Loading...</div>;
	}

	// Определение маршрутов приложения
	return (
		<Routes>
			{/* Главная страница */}
			<Route path='/' element={<Home socket={socket} />} />

			{/* Маршрут для входа */}
			<Route path='/login' element={<Login setAuthToken={setAuthToken} />} />

			{/* Маршрут для регистрации */}
			<Route path='/register' element={<Register />} />

			{/* Маршрут для восстановления пароля */}
			<Route path='/forgot-password' element={<ForgotPassword />} />

			{/* Маршрут  для обработки сброса пароля*/}
			<Route path='/reset/:token' element={<ResetPassword />} />

			{/* Маршрут для чата*/}
			<Route
				path='/chat'
				element={
					isAuthenticated ? ( // Проверка isAuthenticated напрямую
						<ChatPage socket={socket} /> // Если аутентифицирован, рендерим страницу чата
					) : (
						<Login /> // Перенаправление на страницу входа, если не выполнена аутентификация
					)
				}
			/>
		</Routes>
	);
}

export default App;
