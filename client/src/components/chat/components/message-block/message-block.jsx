import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";

const MessageBlock = ({ socket, replyTo, setReplyTo }) => {
	const [message, setMessage] = useState("");
	const [replyingToMessage, setReplyingToMessage] = useState(null);

	useEffect(() => {
		if (replyTo) {
			// Получаем данные о сообщении, на которое отвечаем
			setReplyingToMessage({
				id: replyTo,
				text: "Текст сообщения, на которое отвечаем",
				name: "Имя отправителя",
			});
		} else {
			setReplyingToMessage(null);
		}
	}, [replyTo]);

	const isTyping = () =>
		socket.emit("typing", `${localStorage.getItem("user")} is typing`);

	const handleSend = (e) => {
		e.preventDefault();
		if (message.trim() && localStorage.getItem("user")) {
			socket.emit("message", {
				text: message,
				name: localStorage.getItem("user"),
				id: `${socket.id}-${Math.random()}`,
				socketID: socket.id,
				parentId: replyTo,
			});
			setMessage("");
			setReplyTo(null);
		}
	};

	const cancelReply = () => {
		setReplyTo(null);
		setReplyingToMessage(null);
	};

	return (
		<div className={styles.messageBlock}>
			{replyingToMessage && (
				<div className={styles.replyingTo}>
					<p>Ответ на сообщение от {replyingToMessage.name}:</p>
					<p>{replyingToMessage.text}</p>
					<button onClick={cancelReply}>Отменить ответ</button>
				</div>
			)}
			<form className={styles.form} onSubmit={handleSend}>
				<input
					type='text'
					className={styles.userMessage}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyDown={isTyping}
					placeholder={
						replyingToMessage ? "Введите ваш ответ..." : "Введите сообщение..."
					}
				/>
				<button className={styles.btn} type='submit'>
					{replyingToMessage ? "Ответить" : "Отправить"}
				</button>
			</form>
		</div>
	);
};

export default MessageBlock;
