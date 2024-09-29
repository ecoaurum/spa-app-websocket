import React, { useEffect, useState } from "react";
import SideBar from "./components/sidebar/sidebar";
import Body from "./components/body/body";
import MessageBlock from "./components/message-block/message-block";
import styles from "./styles.module.css";

const ChatPage = ({ socket }) => {
	const [messages, setMessages] = useState([]);
	const [status, setStatus] = useState("");
	const [replyTo, setReplyTo] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		socket.on("response", (data) => {
			setMessages((prevMessages) => {
				if (data.parentId) {
					// Если это ответ, найдем родительское сообщение и добавим ответ
					return updateMessagesWithReply(prevMessages, data);
				} else {
					// Если это новое сообщение, добавляем его в конец списка
					return [...prevMessages, data];
				}
			});
		});

		// Запрашиваем первую страницу сообщений при загрузке
		socket.emit("getMessages", 1);

		socket.on("messagesPage", (data) => {
			setMessages(data.messages);
			setTotalPages(data.totalPages);
			setCurrentPage(data.currentPage);
		});

		socket.on("response", (data) => {
			setMessages(data.messages);
			setTotalPages(data.totalPages);
			setCurrentPage(1); // Переходим на первую страницу при получении нового сообщения
		});

		socket.on("responseTyping", (data) => {
			setStatus(data);
			setTimeout(() => setStatus(""), 1000);
		});

		return () => {
			socket.off("messagesPage");
			socket.off("response");
			socket.off("responseTyping");
		};
	}, [socket]);

	const handlePageChange = (page) => {
		socket.emit("getMessages", page);
	};

	// Функция для обновления сообщений с ответом
	const updateMessagesWithReply = (messages, newReply) => {
		return messages.map((msg) => {
			if (msg.id === newReply.parentId) {
				return { ...msg, replies: [...(msg.replies || []), newReply] };
			}
			if (msg.replies) {
				return {
					...msg,
					replies: updateMessagesWithReply(msg.replies, newReply),
				};
			}
			return msg;
		});
	};

	return (
		<div className={styles.chat}>
			<SideBar socket={socket} />
			<main className={styles.main}>
				<Body
					messages={messages}
					status={status}
					socket={socket}
					setReplyTo={setReplyTo}
					currentPage={currentPage}
					totalPages={totalPages}
					loadMoreMessages={handlePageChange}
				/>
				<MessageBlock
					socket={socket}
					replyTo={replyTo}
					setReplyTo={setReplyTo}
				/>
			</main>
		</div>
	);
};

export default ChatPage;
