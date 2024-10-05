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
	const [image, setImage] = useState(null); // Для хранения файла изображения

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

	const handleImageChange = (e) => {
		setImage(e.target.files[0]);
	};

	const handleSend = async (e) => {
		e.preventDefault();
		try {
			if (message.trim() && name && email && captcha) {
				let imageUrl = null;

				if (image) {
					const formData = new FormData();
					formData.append("image", image);
					const response = await fetch("http://localhost:5000/upload-image", {
						method: "POST",
						body: formData,
					});

					if (!response.ok) {
						throw new Error("Ошибка загрузки изображения");
					}

					const result = await response.json();
					imageUrl = result.imageUrl;
				}

				socket.emit("message", {
					name,
					email,
					homepage,
					text: message,
					captcha,
					imageUrl,
					parentId: replyTo ? replyTo.id : null,
					quotetext: replyTo ? replyTo.text : null,
				});

				setMessage("");
				setCaptcha("");
				fetchCaptcha();
				setReplyTo(null);
				setImage(null);
			}
		} catch (error) {
			console.error("Ошибка при отправке сообщения:", error);
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
				{/* Поле для загрузки изображения */}
				<input type='file' onChange={handleImageChange} accept='image/*' />
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
