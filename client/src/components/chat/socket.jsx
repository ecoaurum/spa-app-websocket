// Этот код инициализирует подключение к серверу с помощью socket.io-client,
// затем экспортирует этот экземпляр для использования в других модулях.
// Это обеспечивает взаимодействие в реальном времени между клиентом и сервером.
//==============================================================================

// Импортируем библиотеку socket.io-client для работы с сокетами
import io from "socket.io-client";

// Создаем экземпляр сокета, подключаемся к серверу по указанному URL
const socket = io(import.meta.env.VITE_API_URL, {
	withCredentials: true, // Передаем куки вместе с запросами для обеспечения аутентификации
	transports: ["websocket", "polling"], // Указываем используемые транспортные методы
});

export default socket;
