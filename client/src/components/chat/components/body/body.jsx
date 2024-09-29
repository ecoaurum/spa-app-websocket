import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const Body = ({ messages, status, socket, setReplyTo }) => {
	const navigate = useNavigate();
	const [replyingTo, setReplyingTo] = useState(null);

	const handleLeave = () => {
		const user = localStorage.getItem("user");
		if (socket) {
			socket.emit("logout", { user, socketID: socket.id });
		}
		localStorage.removeItem("user");
		navigate("/");
	};

	const handleReply = (messageId, userName, text) => {
		setReplyingTo(messageId);
		setReplyTo({ id: messageId, text: text });
		const messageInput = document.querySelector(".userMessage");
		if (messageInput) {
			messageInput.scrollIntoView({ behavior: "smooth" });
			messageInput.focus();
		}
	};

	// Функция для обрезки текста цитаты
	const truncateQuote = (text, maxLength = 100) => {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength - 3) + "...";
	};

	const renderMessages = (messages, depth = 0) => {
		return messages.map((element) => (
			<div key={element.id} style={{ marginLeft: `${depth * 20}px` }}>
				<div className={styles.chats}>
					<p className={styles.senderName}>
						{element.name === localStorage.getItem("user")
							? "Вы"
							: element.name}
					</p>
					<div
						className={
							element.name === localStorage.getItem("user")
								? styles.messageSender
								: styles.messageRecipient
						}
					>
						{/* Добавляем отображение цитаты */}
						{element.quoteText && (
							<div className={styles.quote}>
								<p>{truncateQuote(element.quoteText)}</p>
							</div>
						)}
						<p>{element.text}</p>
					</div>
					<button
						onClick={() => handleReply(element.id, element.name, element.text)}
					>
						Ответить
					</button>
					{replyingTo === element.id && (
						<span className={styles.replyingIndicator}>
							Отвечаем на это сообщение
						</span>
					)}
				</div>
				{element.replies &&
					element.replies.length > 0 &&
					renderMessages(element.replies, depth + 1)}
			</div>
		));
	};

	return (
		<>
			<header className={styles.header}>
				<button className={styles.btn} onClick={handleLeave}>
					Покинуть чат
				</button>
			</header>

			<div className={styles.container}>
				{renderMessages(messages)}
				<div className={styles.status}>
					<p>{status}</p>
				</div>
			</div>
		</>
	);
};

export default Body;
