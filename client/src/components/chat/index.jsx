// Этот компонент обеспечивает работу чата, обработку сообщений и их отображение
// с поддержкой пагинации и сортировки.
//==================================================================

import React, { useEffect, useState } from "react";
import Body from "./components/body/body";
import MessageBlock from "./components/message-block/message-block";
import styles from "./styles.module.css";

// Компонент для отображения страницы чата принимающий сокет в качестве props
const ChatPage = ({ socket }) => {
	const [messages, setMessages] = useState([]); // Создаем состояние для хранения сообщений
	const [status, setStatus] = useState(""); // Состояние для хранения статуса чата
	const [replyTo, setReplyTo] = useState(null); // Состояние для хранения ID сообщения, на которое отвечают
	const [currentPage, setCurrentPage] = useState(1); // Состояние для текущей страницы пагинации
	const [totalPages, setTotalPages] = useState(1); // Состояние для общего количества страниц

	// useEffect для обработки событий socket
	useEffect(() => {
		// Обработчик события "response" от сервера
		socket.on("response", (data) => {
			// Обновляем состояние сообщений с учетом ответа (вложенного сообщения)
			setMessages((prevMessages) => {
				if (data.parentId) {
					return updateMessagesWithReply(prevMessages, data); // Если есть parentId, обновляем сообщения с учетом ответа
				} else {
					return [...prevMessages, data]; // Иначе добавляем новое сообщение в конец
				}
			});
		});

		// Отправляем запрос на получение сообщений с первой страницы
		socket.emit("getMessages", 1);

		// Обработчик события "messagesPage" от сервера
		socket.on("messagesPage", (data) => {
			// Обновляем состояние сообщений
			setMessages(data.messages); // Устанавливаем сообщения
			setTotalPages(data.totalPages); // Устанавливаем общее количество страниц
			setCurrentPage(data.currentPage); // Устанавливаем текущую страницу
		});

		// Обработка события получения нового сообщения от сервера
		socket.on("newMessage", (data) => {
			// Обновляем состояние сообщений с учетом нового сообщения
			setMessages((prevMessages) => {
				if (data.newMessage.parentId) {
					return updateMessagesWithReply(prevMessages, data.newMessage); // Если есть parentId, обновляем сообщения с учетом ответа
				} else {
					return [...prevMessages, data.newMessage]; // Иначе добавляем новое сообщение в конец
				}
			});
		});

		// Функция очистки обработчиков событий при демонтировании компонента
		return () => {
			socket.off("messagesPage");
			socket.off("response");
			socket.off("newMessage");
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
			if (msg.id === newReply.parentId) {
				// Если находим родительское сообщение, добавляем к нему новый ответ
				return { ...msg, replies: [...(msg.replies || []), newReply] };
			}
			// Если текущее сообщение имеет вложенные ответы, рекурсивно вызываем функцию для них
			if (msg.replies) {
				return {
					...msg,
					replies: updateMessagesWithReply(msg.replies, newReply), // Рекурсивно обновляем ответы
				};
			}
			return msg;
		});
	};

	// Функция для получения отсортированных комментариев
	const fetchSortedComments = async (sort, order) => {
		try {
			const response = await fetch(
				`https://spa-app-websocket-server.up.railway.app/api/main-comments?sort=${sort}&order=${order}`
			);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			setMessages(data); // Устанавливаем отсортированные сообщения
		} catch (error) {
			console.error("Failed to fetch sorted comments:", error); // Логируем ошибки
		}
	};

	return (
		<div className={styles.chat}>
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
					status={status}
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
