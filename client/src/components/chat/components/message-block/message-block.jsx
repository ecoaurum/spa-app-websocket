// Этот код представляет собой компонент React,
// который позволяет пользователям отправлять сообщения с различными полями,
// такими как имя, email, домашняя страница, сообщение, изображение и текстовый файл.
// Компонент также включает в себя CAPTCHA для защиты от спама.
//=====================================================================

import React, { useState, useEffect, useRef } from "react"; // Импорт хуков React
import { useNavigate } from "react-router-dom"; // Хук для навигации между страницами
import styles from "./styles.module.css"; // Импортируем стили

// Компонент MessageBlock отвечает за форму отправки сообщений
const MessageBlock = ({ socket, replyTo, setReplyTo }) => {
	const [message, setMessage] = useState(""); // Состояние для текста сообщения
	const [name, setName] = useState(""); // Состояние для имени пользователя
	const [email, setEmail] = useState(""); // Состояние для email
	const [homepage, setHomepage] = useState(""); // Состояние для домашней страницы
	const [replyingToMessage, setReplyingToMessage] = useState(null); // Состояние для отслеживания ответа на сообщение
	const [captcha, setCaptcha] = useState(""); // Состояние для CAPTCHA
	const [captchaSvg, setCaptchaSvg] = useState(""); // Состояние для хранения CAPTCHA изображения
	const [image, setImage] = useState(null); // Состояние для хранения файла изображения
	const [textFile, setTextFile] = useState(null); // Состояние для хранения текстового файла
	const [errors, setErrors] = useState({}); // Состояние для хранения ошибок валидации
	const [fileErrors, setFileErrors] = useState({}); // Состояние для ошибок загрузки файлов
	const [captchaError, setCaptchaError] = useState(""); // Состояние -  ошибка ввода CAPTCHA
	const [showPreview, setShowPreview] = useState(false); // Состояние для предпросмотра
	const textareaRef = useRef(null); // Ссылка на текстовое поле для вставки тегов
	const navigate = useNavigate(); // Хук для навигации

	// Установка сообщения, на которое пользователь отвечает
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
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/captcha`
			);
			if (response.ok) {
				const captchaSvgText = await response.text();
				setCaptchaSvg(captchaSvgText); // Сохраняем полученное изображение CAPTCHA
			} else {
				console.error("Ошибка при получении CAPTCHA");
			}
		} catch (error) {
			console.error("Ошибка запроса CAPTCHA:", error);
		}
	};

	// Обработчик изменения загружаемого изображения
	const handleImageChange = (e) => {
		const file = e.target.files[0];

		// Проверяем размер файла изображения
		if (file && file.size > 1 * 1024 * 1024) {
			setFileErrors((prev) => ({
				...prev,
				image: "Размер изображения не должен превышать 1 МБ.",
			}));
			setImage(null); // Очищаем, если размер превышает лимит
		} else {
			setFileErrors((prev) => ({ ...prev, image: "" }));
			setImage(file);
		}
	};

	// Обработчик изменения загружаемого текстового файла
	const handleFileChange = (e) => {
		const file = e.target.files[0];

		// Проверяем размер текстового файла
		if (file && file.size > 100 * 1024) {
			setFileErrors((prev) => ({
				...prev,
				textFile: "Размер текстового файла не должен превышать 100 КБ.",
			}));
			setTextFile(null); // Очищаем, если размер превышает лимит
		} else {
			setFileErrors((prev) => ({ ...prev, textFile: "" }));
			setTextFile(file);
		}
	};

	// Обработчик отправки сообщения
	const handleSend = async (e) => {
		e.preventDefault(); // Предотвращаем стандартное поведение формы
		if (!validateInputs()) return; // Прерываем отправку, если есть ошибки
		try {
			if (message.trim() && name && email && captcha) {
				// Проверяем, что все поля заполнены
				let imageUrl = null; // Переменная для хранения URL загруженного изображения
				let textFileUrl = null; // Переменная для хранения URL загруженного текстового файла

				// Загружаем изображение, если выбрано
				if (image) {
					const formData = new FormData(); // Создаем объект FormData для отправки изображения
					formData.append("image", image); // Добавляем изображение в FormData
					// Отправляем запрос на загрузку изображения
					const response = await fetch(
						`${import.meta.env.VITE_API_URL}/api/upload-image`,
						{
							method: "POST",
							body: formData,
						}
					);

					if (!response.ok) {
						// Проверяем, что запрос прошел успешно
						throw new Error("Ошибка загрузки изображения"); // Бросаем ошибку, если запрос не успешен
					}

					const result = await response.json(); // Парсим ответ сервера
					imageUrl = result.imageUrl; // Сохраняем URL загруженного изображения
				}

				// Загружаем текстовый файл, если выбран
				if (textFile) {
					const formData = new FormData(); // Создаем объект FormData для отправки текстового файла
					formData.append("file", textFile); // Добавляем текстовый файл в FormData
					// Отправляем запрос на загрузку текстового файла
					const response = await fetch(
						`${import.meta.env.VITE_API_URL}/api/upload-file`,
						{
							method: "POST",
							body: formData,
						}
					);

					if (!response.ok) {
						// Проверяем, что запрос прошел успешно
						throw new Error("Ошибка загрузки текстового файла"); // Бросаем ошибку, если запрос не успешен
					}

					const result = await response.json(); // Парсим ответ сервера
					textFileUrl = result.fileUrl; // Сохраняем URL загруженного текстового файла
				}

				// Отправка сообщения на сервер через socket
				socket.emit("message", {
					name,
					email,
					homepage,
					text: message,
					captcha,
					imageUrl,
					textFileUrl,
					parentid: replyTo ? replyTo.id : null, // Если это ответ на другое сообщение, указываем его ID
					quotetext: replyTo ? replyTo.text : null, // Если это ответ на другое сообщение, включаем текст цитаты
				});

				// Обрабатываем ответ сервера для CAPTCHA
				socket.on("error", (data) => {
					if (data.message === "Неверная CAPTCHA") {
						// Если CAPTCHA неверна
						setCaptchaError("Неверная CAPTCHA, попробуйте снова."); // Устанавливаем сообщение об ошибке
						fetchCaptcha(); // Обновляем CAPTCHA
					} else {
						console.error("Ошибка от сервера:", data.message);
					}
				});

				// Очищаем поля формы после отправки
				setName("");
				setEmail("");
				setHomepage("");
				setMessage("");
				setCaptcha("");
				setCaptchaError(""); // Очищаем сообщение об ошибке CAPTCHA
				fetchCaptcha(); // Обновляем CAPTCHA
				setReplyTo(null); // Сбрасываем состояние ответа
				setImage(null); // Убираем загруженное изображение
				setTextFile(null); // Убираем загруженный текстовый файл
				setShowPreview(false); // Скрываем предпросмотр
			}
		} catch (error) {
			console.error("Ошибка при отправке сообщения:", error);
		}
	};

	// Отмена ответа на сообщение
	const cancelReply = () => {
		setReplyTo(null); // Сбрасываем состояние ответа
		setReplyingToMessage(null); // Очищаем сообщение, на которое отвечаем
	};

	// функция для обработки ввода в поле имени
	const handleNameChange = (e) => {
		const inputValue = e.target.value; // Получаем значение из поля ввода
		const latinOnly = inputValue.replace(/[^a-zA-Z]/g, ""); // Оставляем только латинские буквы
		setName(latinOnly); // Устанавливаем состояние с отфильтрованным значением
	};

	// Валидация полей формы перед отправкой
	const validateInputs = () => {
		const newErrors = {}; // Объект для хранения ошибок валидации
		const latinRegex = /^[a-zA-Z]+$/; // Регулярное выражение для проверки латинских букв
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Регулярное выражение для проверки email
		const urlRegex =
			/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+([/?].*)?$/; // Регулярное выражение для проверки URL

		// Валидация поля имени
		if (!name.trim()) {
			newErrors.name = "Имя не должно быть пустым"; // Добавляем ошибку, если имя пустое
		} else if (!latinRegex.test(name)) {
			newErrors.name = "Имя должно содержать только латинские буквы"; // Добавляем ошибку, если имя содержит не латинские буквы
		}
		// Валидация поля с email
		if (!email.trim() || !emailRegex.test(email)) {
			newErrors.email = "Некорректный email"; // Добавляем ошибку, если email некорректен
		}
		// Валидация поля с тектсом сообщения
		if (!message.trim()) {
			newErrors.message = "Сообщение не должно быть пустым"; // Добавляем ошибку, если сообщение пустое
		} else if (message.length > 1000) {
			newErrors.message = "Сообщение не должно превышать 1000 символов"; // Добавляем ошибку, если сообщение слишком длинное
		}
		// Валидация домашней страницы (если указана)
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
		// Проверяем, прошли ли все поля валидацию
		if (validateInputs()) {
			// Если да, показываем окно предпросмотра
			setShowPreview(true);
		}
	};

	// Компонент предпросмотра сообщения
	const Preview = () => (
		// Основной контейнер предпросмотра с применением стилей
		<div className={styles.preview}>
			<h3>Предпросмотр сообщения</h3>
			<p>
				<strong>Имя:</strong> {name}
			</p>
			<p>
				<strong>Email:</strong> {email}
			</p>
			{/* Если есть домашняя страница, отображаем её как ссылку */}
			{homepage && (
				<p>
					<strong>Домашняя страница:</strong>{" "}
					<a href={homepage} target='_blank' rel='noopener noreferrer'>
						{homepage}
					</a>
				</p>
			)}
			<p>
				{/* Отображаем текст сообщения */}
				<strong>Сообщение:</strong> {message}
			</p>
			{/* Если есть изображение, отображаем его имя */}
			{image && (
				<p>
					<strong>Изображение:</strong> {image.name}
				</p>
			)}
			{/* Если есть текстовый файл, отображаем его имя */}
			{textFile && (
				<p>
					<strong>Текстовый файл:</strong> {textFile.name}
				</p>
			)}
			{/* Если мы отвечаем на сообщение, отображаем текст цитаты */}
			{replyingToMessage && (
				<p>
					<strong>Ответ на:</strong> {replyingToMessage.text}
				</p>
			)}
			{/* Кнопка для закрытия окна предпросмотра */}
			<button onClick={() => setShowPreview(false)}>
				Закрыть предпросмотр
			</button>
		</div>
	);

	// функция для вставки HTML-тегов:
	const insertTag = (tag) => {
		const textarea = textareaRef.current; // Ссылка на элемент textarea
		const start = textarea.selectionStart; // Начальная позиция выделенного текста
		const end = textarea.selectionEnd; // Конечная позиция выделенного текста
		const text = textarea.value; // Текущий текст в textarea
		const before = text.substring(0, start); // Текст перед выделением
		const after = text.substring(end); // Текст после выделения
		let insertion = ""; // Переменная для хранения вставляемого HTML-тега

		// В зависимости от типа тега, создаем соответствующий HTML
		switch (tag) {
			case "i":
			case "strong":
			case "code":
				insertion = `<${tag}>${text.substring(start, end)}</${tag}>`; // Вставляем теги для выделенного текста
				break;
			case "a":
				const url = prompt("Введите URL для ссылки:", "http://"); // Спрашиваем URL для тега <a>
				if (url) {
					insertion = `<a href="${url}">${text.substring(start, end)}</a>`; // Вставляем тег <a> с URL
				}
				break;
		}

		// Обновляем текст в textarea с вставленными тегами
		setMessage(before + insertion + after);
		textarea.focus(); // Устанавливаем фокус на textarea
		textarea.setSelectionRange(
			start + insertion.length,
			start + insertion.length
		); // Перемещаем курсор после вставленного текста
	};

	// Функция для выхода из чата
	const handleLeave = () => {
		const user = localStorage.getItem("user"); // Получаем имя пользователя из локального хранилища
		if (socket) {
			socket.emit("logout", { user, socketID: socket.id }); // Отправляем событие выхода на сервер
		}
		localStorage.removeItem("user"); // Удаляем имя пользователя из локального хранилища
		navigate("/"); // Перенаправляем пользователя на главную страницу
	};

	// Возврат элемента
	return (
		<div className={styles.messageBlock}>
			{/* Заголовок с кнопкой для выхода из чата */}
			<header className={styles.header}>
				<button className={styles.btn} onClick={handleLeave}>
					Покинуть чат
				</button>
			</header>

			{/* Если отображается предпросмотр сообщения */}
			{showPreview ? (
				<Preview />
			) : (
				// Форма для отправки сообщения
				<form className={styles.form} onSubmit={handleSend}>
					{/* Поле ввода имени */}
					<input
						type='text'
						value={name}
						onChange={handleNameChange}
						placeholder='Ваше имя (только латинские буквы)'
						required
					/>
					{/* Отображение ошибки имени, если она есть */}
					{errors.name && <span className={styles.error}>{errors.name}</span>}

					{/* Поле ввода email */}
					<input
						type='email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder='Ваш email'
						required
					/>
					{/* Отображение ошибки email, если она есть */}
					{errors.email && <span className={styles.error}>{errors.email}</span>}

					{/* Поле ввода домашней страницы */}
					<input
						type='text'
						value={homepage}
						onChange={(e) => setHomepage(e.target.value)}
						placeholder='Ваша домашняя страница (необязательно)'
					/>
					{/* Отображение ошибки домашней страницы, если она есть */}
					{errors.homepage && (
						<span className={styles.error}>{errors.homepage}</span>
					)}

					{/* Панель инструментов для вставки HTML-тегов */}
					<div className={styles.htmlToolbar}>
						<button type='button' onClick={() => insertTag("i")}>
							[i]
						</button>
						<button type='button' onClick={() => insertTag("strong")}>
							[strong]
						</button>
						<button type='button' onClick={() => insertTag("code")}>
							[code]
						</button>
						<button type='button' onClick={() => insertTag("a")}>
							[a]
						</button>
					</div>

					{/* Поле для ввода сообщения */}
					<textarea
						className={`${styles.input} ${styles.messageTextarea}`}
						ref={textareaRef}
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
					{/* Отображение ошибки сообщения, если она есть */}
					{errors.message && (
						<span className={styles.error}>{errors.message}</span>
					)}

					{/* Поле для загрузки изображения */}
					<label htmlFor='image-upload'>
						<strong>Загрузить картинку:</strong>
					</label>
					<input type='file' onChange={handleImageChange} accept='image/*' />
					{/* Отображение ошибки загрузки изображения, если она есть */}
					{fileErrors.image && (
						<span className={styles.error}>{fileErrors.image}</span>
					)}

					{/* Поле для загрузки текстового файла */}
					<label htmlFor='text-file-upload'>
						<strong>Загрузить текстовый файл:</strong>
					</label>
					<input type='file' onChange={handleFileChange} accept='.txt' />
					{/* Отображение ошибки загрузки текстового файла, если она есть */}
					{fileErrors.textFile && (
						<span className={styles.error}>{fileErrors.textFile}</span>
					)}

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
					{/* Сообщение об ошибке CAPTCHA */}
					{captchaError && <span className={styles.error}>{captchaError}</span>}

					{/* Кнопка для отправки сообщения */}
					<button type='submit'>
						{replyingToMessage ? "Ответить" : "Отправить"}
					</button>

					{/* Кнопка для отмены ответа на сообщение */}
					{replyingToMessage && (
						<button type='button' onClick={cancelReply}>
							Отменить ответ
						</button>
					)}

					{/* Кнопка для предпросмотра сообщения */}
					<button type='button' onClick={handlePreview}>
						Предпросмотр сообщения
					</button>
				</form>
			)}
		</div>
	);
};

export default MessageBlock;
