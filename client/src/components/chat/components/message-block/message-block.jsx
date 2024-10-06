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
	const [textFile, setTextFile] = useState(null); // Для хранения текстового файла
	const [errors, setErrors] = useState({}); // Для хранения ошибок валидации
	const [showPreview, setShowPreview] = useState(false); // Новое состояние для предпросмотра

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

	const handleImageChange = (e) => {
		setImage(e.target.files[0]);
	};

	const handleFileChange = (e) => {
		setTextFile(e.target.files[0]);
	};

	const handleSend = async (e) => {
		e.preventDefault();
		if (!validateInputs()) return; // Прерываем отправку, если есть ошибки
		try {
			if (message.trim() && name && email && captcha) {
				let imageUrl = null;
				let textFileUrl = null;

				// Загружаем изображение, если выбрано
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

				// Загружаем текстовый файл, если выбран
				if (textFile) {
					const formData = new FormData();
					formData.append("file", textFile);
					const response = await fetch("http://localhost:5000/upload-file", {
						method: "POST",
						body: formData,
					});

					if (!response.ok) {
						throw new Error("Ошибка загрузки текстового файла");
					}

					const result = await response.json();
					textFileUrl = result.fileUrl;
				}

				socket.emit("message", {
					name,
					email,
					homepage,
					text: message,
					captcha,
					imageUrl,
					textFileUrl, // Отправляем URL текстового файла
					parentId: replyTo ? replyTo.id : null,
					quotetext: replyTo ? replyTo.text : null,
				});

				setName("");
				setEmail("");
				setHomepage("");
				setMessage("");
				setCaptcha("");
				fetchCaptcha();
				setReplyTo(null);
				setImage(null);
				setTextFile(null); // Очищаем текстовый файл после отправки
				setShowPreview(false);
			}
		} catch (error) {
			console.error("Ошибка при отправке сообщения:", error);
		}
	};

	const cancelReply = () => {
		setReplyTo(null);
		setReplyingToMessage(null);
	};

	// Валидация полей
	const validateInputs = () => {
		const newErrors = {};
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		// const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
		const urlRegex =
			/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+([/?].*)?$/;

		if (!name.trim()) {
			newErrors.name = "Имя не должно быть пустым";
		}
		if (!email.trim() || !emailRegex.test(email)) {
			newErrors.email = "Некорректный email";
		}
		if (!message.trim()) {
			newErrors.message = "Сообщение не должно быть пустым";
		} else if (message.length > 1000) {
			newErrors.message = "Сообщение не должно превышать 1000 символов";
		}
		if (homepage) {
			if (!urlRegex.test(homepage)) {
				newErrors.homepage = "Некорректный формат URL";
			} else if (
				!homepage.startsWith("http://") &&
				!homepage.startsWith("https://")
			) {
				// Если URL валиден, но не начинается с http:// или https://, добавляем https://
				setHomepage(`https://${homepage}`);
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0; // Если ошибок нет, возвращаем true
	};

	// Новая функция для обработки предпросмотра
	const handlePreview = () => {
		if (validateInputs()) {
			setShowPreview(true);
		}
	};

	// Компонент предпросмотра
	const Preview = () => (
		<div className={styles.preview}>
			<h3>Предпросмотр сообщения</h3>
			<p>
				<strong>Имя:</strong> {name}
			</p>
			<p>
				<strong>Email:</strong> {email}
			</p>
			{homepage && (
				<p>
					<strong>Домашняя страница:</strong>{" "}
					<a href={homepage} target='_blank' rel='noopener noreferrer'>
						{homepage}
					</a>
				</p>
			)}
			<p>
				<strong>Сообщение:</strong> {message}
			</p>
			{image && (
				<p>
					<strong>Изображение:</strong> {image.name}
				</p>
			)}
			{textFile && (
				<p>
					<strong>Текстовый файл:</strong> {textFile.name}
				</p>
			)}
			{replyingToMessage && (
				<p>
					<strong>Ответ на:</strong> {replyingToMessage.text}
				</p>
			)}
			<button onClick={() => setShowPreview(false)}>
				Закрыть предпросмотр
			</button>
		</div>
	);

	return (
		<div className={styles.messageBlock}>
			{showPreview ? (
				<Preview />
			) : (
				<form className={styles.form} onSubmit={handleSend}>
					<input
						type='text'
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder='Ваше имя'
						required
					/>
					{errors.name && <span className={styles.error}>{errors.name}</span>}

					<input
						type='email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder='Ваш email'
						required
					/>
					{errors.email && <span className={styles.error}>{errors.email}</span>}

					<input
						type='text'
						value={homepage}
						onChange={(e) => setHomepage(e.target.value)}
						placeholder='Ваша домашняя страница (необязательно)'
					/>
					{errors.homepage && (
						<span className={styles.error}>{errors.homepage}</span>
					)}

					<textarea
						className={`${styles.input} ${styles.messageTextarea}`}
						type='text'
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder={
							replyingToMessage
								? "Введите ваш ответ..."
								: "Введите сообщение..."
						}
						required
					/>
					{errors.message && (
						<span className={styles.error}>{errors.message}</span>
					)}

					{/* Поле для загрузки изображения */}
					<label htmlFor='image-upload'>
						<strong>Загрузить картинку:</strong>
					</label>
					<input type='file' onChange={handleImageChange} accept='image/*' />

					{/* Поле для загрузки текстового файла */}
					<label htmlFor='text-file-upload'>
						<strong>Загрузить текстовый файл:</strong>
					</label>
					<input type='file' onChange={handleFileChange} accept='.txt' />

					{/* CAPTCHA изображение */}
					<div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
					{/* Кнопка для обновления CAPTCHA */}
					<button type='button' onClick={fetchCaptcha}>
						Обновить CAPTCHA
					</button>

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

					{/* Новая кнопка для предпросмотра */}
					<button type='button' onClick={handlePreview}>
						Предпросмотр сообщения
					</button>
				</form>
			)}
		</div>
	);
};

export default MessageBlock;
