import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";

const MessageBlock = ({ socket, replyTo, setReplyTo }) => {
	const [message, setMessage] = useState("");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [homepage, setHomepage] = useState("");
	const [replyingToMessage, setReplyingToMessage] = useState(null);
	const [captcha, setCaptcha] = useState("");
	const [captchaSvg, setCaptchaSvg] = useState(""); // Для хранения CAPTCHA изображения

	useEffect(() => {
		if (replyTo) {
			setReplyingToMessage(replyTo);
		} else {
			setReplyingToMessage(null);
		}
	}, [replyTo]);

	// Загрузка CAPTCHA при монтировании компонента
	useEffect(() => {
		fetchCaptcha();
	}, []);

	// Функция для получения нового изображения CAPTCHA
	const fetchCaptcha = async () => {
		try {
			const response = await fetch("http://localhost:5000/captcha");
			if (response.ok) {
				const captchaSvgText = await response.text();
				setCaptchaSvg(captchaSvgText);
			} else {
				console.error("Ошибка при получении CAPTCHA");
			}
		} catch (error) {
			console.error("Ошибка запроса CAPTCHA:", error);
		}
	};

	const isTyping = () => socket.emit("typing", `${name} is typing`);

	const handleSend = (e) => {
		e.preventDefault();
		if (message.trim() && name && email && captcha) {
			socket.emit("message", {
				name,
				email,
				homepage,
				text: message,
				captcha, // Передаем CAPTCHA вместе с сообщением
				id: `${socket.id}-${Math.random()}`,
				socketID: socket.id,
				parentId: replyTo ? replyTo.id : null,
				quotetext: replyTo ? replyTo.text : null,
			});
			setMessage("");
			setCaptcha(""); // Очищаем CAPTCHA поле
			fetchCaptcha(); // Загружаем новую CAPTCHA
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
				{/* CAPTCHA изображение */}
				<div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
				{/* Поле для ввода CAPTCHA */}
				<input
					type='text'
					value={captcha}
					onChange={(e) => setCaptcha(e.target.value)}
					placeholder='Введите CAPTCHA'
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
