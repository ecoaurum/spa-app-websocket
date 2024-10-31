// Этот компонент обеспечивает работу чата, обработку сообщений и их отображение
// с поддержкой пагинации и сортировки.
//==================================================================

import React, { useEffect, useState } from "react";
import Body from "./components/body/body";
import MessageBlock from "./components/message-block/message-block";
import styles from "./styles.module.css";
// import "dotenv/config";

// Компонент для отображения страницы чата принимающий сокет в качестве props
const ChatPage = ({ socket }) => {
	const [messages, setMessages] = useState([]); // Создаем состояние для хранения сообщений
	const [status, setStatus] = useState(""); // Состояние для хранения статуса чата
	const [replyTo, setReplyTo] = useState(null); // Состояние для хранения ID сообщения, на которое отвечают
	const [currentPage, setCurrentPage] = useState(1); // Состояние для текущей страницы пагинации
	const [totalPages, setTotalPages] = useState(1); // Состояние для общего количества страниц

	// Основной useEffect для обработки событий сокета
	useEffect(() => {
		// Функция для обработки события "messagesPage" от сервера
		const handleMessagesPage = (data) => {
			// console.log("Получены данные страницы сообщений:", data);
			if (data && data.messages) {
				// Обновляем состояние сообщений, добавляя только уникальные
				setMessages((prevMessages) => {
					const uniqueMessages = data.messages.filter(
						(msg) => !prevMessages.some((prevMsg) => prevMsg.id === msg.id)
					);

					return [...prevMessages, ...uniqueMessages]; // Объединяем старые и новые сообщения
				});
			}
			setTotalPages(data.totalPages || 1); // Устанавливаем общее количество страниц
			setCurrentPage(data.currentPage || 1); // Устанавливаем текущую страницу
		};

		// Функция для обработки события "response" от сервера
		const handleResponse = (data) => {
			console.log("Ответ с сервера:", data);
			setMessages((prevMessages) => {
				if (data.parentid) {
					// Если есть родительское сообщение, обновляем его с новым ответом
					return updateMessagesWithReply(prevMessages, data);
				} else {
					// Если сообщение новое, добавляем его в массив сообщений
					return prevMessages.some((msg) => msg.id === data.id)
						? prevMessages
						: [...prevMessages, data];
				}
			});
		};

		// Функция для обработки события "newMessage" от сервера
		const handleNewMessage = (data) => {
			if (data.newMessage) {
				setMessages((prevMessages) => {
					const isNew = !prevMessages.some(
						(msg) => msg.id === data.newMessage.id
					);
					if (isNew) {
						if (data.newMessage.parentid) {
							// Если новое сообщение является ответом, обновляем его
							return updateMessagesWithReply(prevMessages, data.newMessage);
						} else {
							// Иначе просто добавляем новое сообщение
							return [...prevMessages, data.newMessage];
						}
					}
					return prevMessages; // Если сообщение уже существует, возвращаем предыдущее состояние
				});
			}
		};

		// Установка подписок на события сокета
		socket.on("messagesPage", handleMessagesPage);
		socket.on("response", handleResponse);
		socket.on("newMessage", handleNewMessage);

		// Запрашиваем сообщения первой страницы при подключении
		socket.emit("getMessages", 1);

		// Очистка подписок на события при размонтировании
		return () => {
			socket.off("messagesPage", handleMessagesPage);
			socket.off("response", handleResponse);
			socket.off("newMessage", handleNewMessage);
		};
	}, [socket]);

	// Функция для смены страницы пагинации
	const handlePageChange = (page) => {
		socket.emit("getMessages", page); // Отправка запроса на получение сообщений нужной страницы
	};

	// Функция для обновления сообщений с учетом вложенного ответа (рекурсивная)
	const updateMessagesWithReply = (messages, newReply) => {
		return messages.map((msg) => {
			// Проверяем, является ли текущее сообщение родительским для ответа
			if (msg.id === newReply.parentid) {
				const existingReplies = msg.replies || []; // Получаем существующие ответы

				// Проверяем, есть ли новый ответ уже в replies по его `id`
				const isReplyExists = existingReplies.some(
					(reply) => reply.id === newReply.id
				);

				if (!isReplyExists) {
					// Если ответ еще не существует, добавляем его в массив ответов
					return { ...msg, replies: [...existingReplies, newReply] };
				}
				return msg; // Возвращаем сообщение без изменений, если ответ уже существует
			}
			// Если текущее сообщение имеет вложенные ответы, рекурсивно вызываем функцию для них
			if (msg.replies) {
				return {
					...msg,
					replies: updateMessagesWithReply(msg.replies, newReply), // Рекурсивно обновляем ответы
				};
			}
			return msg; // Возвращаем сообщение без изменений, если оно не требует обновления
		});
	};

	// Функция для получения отсортированных комментариев
	const fetchSortedComments = async (sort, order) => {
		try {
			const response = await fetch(
				`${
					import.meta.env.VITE_API_URL
				}/api/main-comments?sort=${sort}&order=${order}`
			);
			if (!response.ok) {
				throw new Error("Network response was not ok"); // Обработка ошибок сети
			}
			const data = await response.json(); // Получаем данные в формате JSON
			setMessages(data); // Устанавливаем отсортированные сообщения
		} catch (error) {
			console.error("Failed to fetch sorted comments:", error); // Логируем ошибки
		}
	};

	// Возвращаем JSX-код для отображения страницы чата
	return (
		<div className={styles.chat}>
			{" "}
			{/* Обертка для чата */}
			<main className={styles.main}>
				{/* Компонент MessageBlock для ввода сообщения */}
				<MessageBlock
					socket={socket} // Передаем сокет для взаимодействия в реальном времени
					replyTo={replyTo} // Передаем сообщение, на которое отвечаем
					setReplyTo={setReplyTo} // Функция для установки состояния ответа
				/>

				{/* Компонент Body для отображения сообщений и управления ими */}
				<Body
					messages={messages} // Передаем массив сообщений
					status={status} // Передаем статус чата
					socket={socket} // Передаем сокет для взаимодействия в реальном времени
					setReplyTo={setReplyTo} // Функция для установки состояния ответа
					currentPage={currentPage} // Передаем текущую страницу
					totalPages={totalPages} // Передаем общее количество страниц
					loadMoreMessages={handlePageChange} // Функция для загрузки больше сообщений при смене страницы
					fetchSortedComments={fetchSortedComments} // Функция для получения отсортированных комментариев
				/>
			</main>
		</div>
	);
};

export default ChatPage;
