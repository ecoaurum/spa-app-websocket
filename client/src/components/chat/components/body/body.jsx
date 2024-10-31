// Этот компонент отвечает за отображение сообщений, управление их сортировкой,
// ответами на сообщения и отображением контента.
//Он также включает функциональность пагинации и модальное окно для просмотра изображений.
//==================================================

import React, { useEffect, useState } from "react"; // Импорт хуков для управления состоянием и эффектами
import Pagination from "../pagination/pagination"; // Импортируем компонент пагинации
import styles from "./styles.module.css"; // Подключаем стили

// Компонент Body отвечает за отображение сообщений и управление их сортировкой
const Body = ({
	messages, // Список сообщений
	status, // Статус соединения
	socket, // Объект для работы с WebSocket
	setReplyTo, // Функция для установки ответа на сообщение
	currentPage, // Номер текущей страницы
	totalPages, // Общее количество страниц
	loadMoreMessages, // Функция для загрузки дополнительных сообщений
	fetchSortedComments, // Функция для получения отсортированных сообщений с сервера
}) => {
	const [replyingTo, setReplyingTo] = useState(null); // Состояние для отслеживания, на какое сообщение пользователь отвечает
	const [imageModal, setImageModal] = useState(null); // Состояние для модального окна с изображением
	const [sortConfig, setSortConfig] = useState({
		// Состояние для сортировки сообщений
		key: "date", // Поле для сортировки (по умолчанию - дата)
		direction: "desc", // Направление сортировки (по умолчанию - по убыванию)
	});

	// Проверка структуры данных сообщений после обновлений
	useEffect(() => {
		console.log("Messages after socket update:", messages); // Проверка структуры
	}, [messages]);

	// Функция для обработки ответа на сообщение
	const handleReply = (messageId, username, messageText) => {
		setReplyingTo(messageId); // Устанавливаем ID сообщения, на которое отвечаем
		setReplyTo({
			id: messageId,
			text: messageText,
			username: username,
		}); // Сохраняем данные для ответа

		// Добавим вывод в консоль для отладки
		console.log("Reply data set:", {
			id: messageId,
			text: messageText,
			username: username,
		});

		const messageInput = document.querySelector(".userMessage"); // Находим поле для ввода сообщения
		if (messageInput) {
			messageInput.scrollIntoView({ behavior: "smooth" }); // Прокручиваем к полю ввода
			messageInput.focus(); // Устанавливаем фокус на поле ввода
		}
	};

	// Функция для форматирования даты и времени
	const formatDateTime = (timestamp) => {
		const date = new Date(timestamp); // Создаем объект даты из временной метки
		return date.toLocaleString("ru-RU", {
			day: "2-digit", // Форматируем день
			month: "2-digit", // Форматируем месяц
			year: "numeric", // Форматируем год
			hour: "2-digit", // Форматируем часы
			minute: "2-digit", // Форматируем минуты
		});
	};

	// Функция для обрезания текста цитаты
	const truncateQuote = (text, maxLength = 100) => {
		// Если текст короче максимальной длины, возвращаем его целиком
		if (text.length <= maxLength) return text;
		// Иначе обрезаем и добавляем многоточие
		return text.slice(0, maxLength - 3) + "...";
	};

	// Функция для обработки клика по заголовку таблицы для сортировки
	const handleSort = (key) => {
		let direction = "asc"; // Устанавливаем начальное направление сортировки - по возрастанию
		if (sortConfig.key === key && sortConfig.direction === "asc") {
			direction = "desc"; // Меняем направление, если кликнули по тому же ключу
		}
		setSortConfig({ key, direction }); // Обновляем состояние сортировки

		// Преобразуем ключ сортировки в формат, который понимает сервер
		let serverSortKey;
		switch (key) {
			case "username":
				serverSortKey = "name"; // Соответствие ключа username
				break;
			case "email":
				serverSortKey = "email"; // Соответствие ключа email
				break;
			case "date":
				serverSortKey = "timestamp"; // Соответствие ключа date
				break;
			default:
				serverSortKey = "timestamp"; // По умолчанию сортируем по времени
		}

		fetchSortedComments(serverSortKey, direction); // Запрашиваем отсортированные комментарии с сервера
	};

	// Отображение заголовков таблицы для сортировки сообщений
	const renderTableHeader = () => (
		<thead className={styles.tableHeader}>
			<tr>
				{/* Заголовок колонки для имени пользователя. Добавляем возможность сортировки. */}
				<th onClick={() => handleSort("username")}>
					User Name{" "}
					{/* Отображаем стрелку, указывающую направление сортировки для имени пользователя. */}
					{sortConfig.key === "username" &&
						(sortConfig.direction === "asc" ? "▲" : "▼")}
				</th>
				{/* Заголовок колонки для email. Добавляем возможность сортировки. */}
				<th onClick={() => handleSort("email")}>
					E-mail{" "}
					{/* Отображаем стрелку, указывающую направление сортировки для email. */}
					{sortConfig.key === "email" &&
						(sortConfig.direction === "asc" ? "▲" : "▼")}
				</th>
				{/* Заголовок колонки для даты. Добавляем возможность сортировки. */}
				<th onClick={() => handleSort("date")}>
					Date{" "}
					{/* Отображаем стрелку, указывающую направление сортировки для даты. */}
					{sortConfig.key === "date" &&
						(sortConfig.direction === "asc" ? "▲" : "▼")}
				</th>
			</tr>
		</thead>
	);

	// Рендер основного списка комментариев
	const renderMainComments = () => (
		<table className={styles.commentsTable}>{renderTableHeader()}</table>
	);

	// Функция для генерации цвета на основе имени пользователя
	const generateColor = (username) => {
		let hash = 0;
		for (let i = 0; i < username.length; i++) {
			hash = username.charCodeAt(i) + ((hash << 5) - hash);
		}

		// Генерируем более светлые оттенки
		const r = (hash & 0xff) + 127;
		const g = ((hash >> 8) & 0xff) + 127;
		const b = ((hash >> 16) & 0xff) + 127;

		// Преобразуем в шестнадцатеричный формат и обеспечиваем, чтобы значения не превышали FF
		const toHex = (value) => Math.min(255, value).toString(16).padStart(2, "0");

		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	};

	// Компонент для отображения содержимого текстового файла
	const TextFileViewer = ({ fileUrl }) => {
		const [fileContent, setFileContent] = useState(""); // Состояние для хранения содержимого файла

		useEffect(() => {
			const fetchFileContent = async () => {
				try {
					const response = await fetch(fileUrl); // Запрос на получение файл
					const text = await response.text(); // Получаем текст из файла
					setFileContent(text); // Сохраняем содержимое файла
				} catch (error) {
					console.error("Ошибка загрузки текстового файла:", error); // Логирование ошибки загрузки
				}
			};

			fetchFileContent(); // Вызов функции загрузки содержимого файла при монтировании компонента
		}, [fileUrl]);

		return (
			<div className={styles.textFileContainer}>
				<pre>{fileContent}</pre> {/* Отображение содержимого файла */}
			</div>
		);
	};

	// Функция для открытия изображения в модальном окне
	const handleImageClick = (imageUrl) => {
		setImageModal(imageUrl); // Устанавливаем URL изображения для показа в модальном окне
	};

	// Функция для закрытия модального окна
	const closeModal = () => {
		setImageModal(null); // Закрываем модальное окно
	};

	// Рекурсивная функция для рендера сообщений и вложенных ответов
	const renderMessages = (messages, depth = 0) => {
		// Проходим по каждому сообщению в массиве messages
		return messages.map((element) => {
			// Генерируем цвет для сообщения на основе имени пользователя
			const backgroundColor = generateColor(element.name);

			// Уникальный ключ, учитывающий уровень вложенности
			const uniqueKey = `${element.id}-${depth}`;

			// console.log("Отображение сообщения:", element); // Лог для отладки

			return (
				// Создаем контейнер для сообщения, используя идентификатор сообщения в качестве ключа
				// и отступ для вложенных сообщений на основе уровня вложенности (depth)
				<div key={uniqueKey} style={{ marginLeft: `${depth * 20}px` }}>
					<div className={styles.chats}>
						<div className={styles.messageHeader}>
							{/* Отображаем имя отправителя сообщения */}
							<p className={styles.senderName}>
								{element.name === localStorage.getItem("user")
									? "Вы"
									: element.name}
							</p>
							{/* Отображаем время отправки сообщения в формате даты */}
							<p className={styles.messageTime}>
								{formatDateTime(element.timestamp)}
							</p>
						</div>
						<div
							className={
								element.name === localStorage.getItem("user")
									? styles.messageSender
									: styles.messageRecipient
							}
							style={{ backgroundColor }}
						>
							{/* Если есть цитата, отображаем её */}
							{element.quotetext && (
								<div className={styles.quote}>
									{/* {console.log("Рендеринг цитаты текста:", element.quotetext)}{" "} */}
									{/* Логирование quotetextReplies found */}
									<p>{truncateQuote(element.quotetext)}</p>
								</div>
							)}
							{/* Отображаем текст сообщения. Используем dangerouslySetInnerHTML для интерпретации HTML */}
							<div dangerouslySetInnerHTML={{ __html: element.text }} />

							{/* Отображаем изображение, если оно было загружено */}
							{element.imageUrl && (
								<div className={styles.mediaContainer}>
									<img
										src={`${import.meta.env.VITE_API_URL}${element.imageUrl}`}
										alt='User upload'
										className={styles.messageImage}
										// Увеличение картинки при клике
										onClick={() =>
											handleImageClick(
												`${import.meta.env.VITE_API_URL}${element.imageUrl}`
											)
										}
									/>
								</div>
							)}
							<br />

							{/* Отображаем ссылку на текстовый файл, если он был загружен */}
							{element.textFileUrl && (
								<div className={styles.mediaContainer}>
									<a
										href={`${import.meta.env.VITE_API_URL}${
											element.textFileUrl
										}`}
										target='_blank'
										rel='noopener noreferrer'
										className={styles.textFileLink}
									>
										Открыть текстовый файл
									</a>
								</div>
							)}
						</div>
						{/* Кнопка для ответа на сообщение */}
						<button
							onClick={() =>
								handleReply(element.id, element.name, element.text)
							}
						>
							Ответить
						</button>
						{/* Если текущее сообщение является тем, на которое отвечают, отображаем индикатор */}
						{replyingTo === element.id && (
							<span className={styles.replyingIndicator}>
								Отвечаем на это сообщение
							</span>
						)}
					</div>
					{/* Если у сообщения есть вложенные ответы, рекурсивно рендерим их */}
					{/* Проверка и рекурсивный рендер вложенных ответов */}
					{element.replies &&
						element.replies.length > 0 &&
						renderMessages(element.replies, depth + 1)}
				</div>
			);
		});
	};

	// Основной рендер компонента
	return (
		<>
			<div className={styles.container}>
				{renderMainComments()} {/* Отображаем заголовки таблицы */}
				{renderMessages(messages)} {/* Отображаем все сообщения */}
				<div className={styles.status}>
					<p>{status}</p> {/* Отображаем статус соединения */}
				</div>
			</div>
			{/* Пагинация, если страниц больше одной */}
			{totalPages > 1 && (
				<Pagination
					currentPage={currentPage} // Текущая страница
					totalPages={totalPages} // Общее количество страниц
					onPageChange={loadMoreMessages} // Функция для загрузки дополнительных сообщений
				/>
			)}
			{/* Модальное окно для отображения увеличенного изображения */}
			{imageModal && (
				<div className={styles.modal} onClick={closeModal}>
					{" "}
					{/* Закрытие модального окна при клике на него */}
					<div className={styles.modalContent}>
						<img src={imageModal} alt='Enlarged' />{" "}
						{/* Отображение увеличенного изображения */}
					</div>
				</div>
			)}
		</>
	);
};

export default Body;
