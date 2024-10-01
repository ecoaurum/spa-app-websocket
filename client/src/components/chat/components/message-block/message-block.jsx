import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";

const MessageBlock = ({ socket, replyTo, setReplyTo }) => {
	const [message, setMessage] = useState("");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [homepage, setHomepage] = useState("");
	const [replyingToMessage, setReplyingToMessage] = useState(null);

	useEffect(() => {
		if (replyTo) {
			setReplyingToMessage(replyTo);
		} else {
			setReplyingToMessage(null);
		}
	}, [replyTo]);

	const isTyping = () => socket.emit("typing", `${name} is typing`);

	const handleSend = (e) => {
		e.preventDefault();
		if (message.trim() && name && email) {
			socket.emit("message", {
				name,
				email,
				homepage,
				text: message,
				id: `${socket.id}-${Math.random()}`,
				socketID: socket.id,
				parentId: replyTo ? replyTo.id : null,
				quotetext: replyTo ? replyTo.text : null,
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
			<form className={styles.form} onSubmit={handleSend}>
				<input
					type='text'
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder='Ваше имя'
					required
				/>
				<input
					type='email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder='Ваш email'
					required
				/>
				<input
					type='url'
					value={homepage}
					onChange={(e) => setHomepage(e.target.value)}
					placeholder='Ваша домашняя страница (необязательно)'
				/>
				<textarea
					className={`${styles.input} ${styles.messageTextarea}`}
					type='text'
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyDown={isTyping}
					placeholder={
						replyingToMessage ? "Введите ваш ответ..." : "Введите сообщение..."
					}
					required
				/>
				<button type='submit'>
					{replyingToMessage ? "Ответить" : "Отправить"}
				</button>
				{replyingToMessage && (
					<button type='button' onClick={cancelReply}>
						Отменить ответ
					</button>
				)}
			</form>
		</div>
	);
};

export default MessageBlock;
