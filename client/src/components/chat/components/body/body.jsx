import React, { useEffect, useState } from "react";
import Pagination from "../pagination/pagination";
import styles from "./styles.module.css";

const Body = ({
	messages,
	status,
	socket,
	setReplyTo,
	currentPage,
	totalPages,
	loadMoreMessages,
	fetchSortedComments,
}) => {
	const [replyingTo, setReplyingTo] = useState(null);
	const [imageModal, setImageModal] = useState(null); // Состояние для модального окна с изображением
	const [sortConfig, setSortConfig] = useState({
		key: "date",
		direction: "desc",
	});

	const handleReply = (messageId, userName, text) => {
		setReplyingTo(messageId);
		setReplyTo({ id: messageId, text: text });
		const messageInput = document.querySelector(".userMessage");
		if (messageInput) {
			messageInput.scrollIntoView({ behavior: "smooth" });
			messageInput.focus();
		}
	};

	const formatDateTime = (timestamp) => {
		const date = new Date(timestamp);
		return date.toLocaleString("ru-RU", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const truncateQuote = (text, maxLength = 100) => {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength - 3) + "...";
	};

	const handleSort = (key) => {
		let direction = "asc";
		if (sortConfig.key === key && sortConfig.direction === "asc") {
			direction = "desc";
		}
		setSortConfig({ key, direction });

		let serverSortKey;
		switch (key) {
			case "username":
				serverSortKey = "name";
				break;
			case "email":
				serverSortKey = "email";
				break;
			case "date":
				serverSortKey = "timestamp";
				break;
			default:
				serverSortKey = "timestamp";
		}

		fetchSortedComments(serverSortKey, direction);
	};

	const renderTableHeader = () => (
		<thead className={styles.tableHeader}>
			<tr>
				<th onClick={() => handleSort("username")}>
					User Name{" "}
					{sortConfig.key === "username" &&
						(sortConfig.direction === "asc" ? "▲" : "▼")}
				</th>
				<th onClick={() => handleSort("email")}>
					E-mail{" "}
					{sortConfig.key === "email" &&
						(sortConfig.direction === "asc" ? "▲" : "▼")}
				</th>
				<th onClick={() => handleSort("date")}>
					Date{" "}
					{sortConfig.key === "date" &&
						(sortConfig.direction === "asc" ? "▲" : "▼")}
				</th>
			</tr>
		</thead>
	);

	const renderMainComments = () => (
		<table className={styles.commentsTable}>{renderTableHeader()}</table>
	);

	const generateColor = (username) => {
		let hash = 0;
		for (let i = 0; i < username.length; i++) {
			hash = username.charCodeAt(i) + ((hash << 5) - hash);
		}

		// Генерируем более светлые оттенки
		const r = (hash & 0xff) + 127;
		const g = ((hash >> 8) & 0xff) + 127;
		const b = ((hash >> 16) & 0xff) + 127;

		// Преобразуем в шестнадцатеричный формат и обеспечиваем, чтобы значения не превышали FF
		const toHex = (value) => Math.min(255, value).toString(16).padStart(2, "0");

		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	};

	// Компонент для отображения содержимого текстового файла
	const TextFileViewer = ({ fileUrl }) => {
		const [fileContent, setFileContent] = useState("");

		useEffect(() => {
			const fetchFileContent = async () => {
				try {
					const response = await fetch(fileUrl);
					const text = await response.text();
					setFileContent(text);
				} catch (error) {
					console.error("Ошибка загрузки текстового файла:", error);
				}
			};

			fetchFileContent();
		}, [fileUrl]);

		return (
			<div className={styles.textFileContainer}>
				<pre>{fileContent}</pre> {/* Отображение содержимого файла */}
			</div>
		);
	};

	// Функция для открытия изображения в модальном окне
	const handleImageClick = (imageUrl) => {
		setImageModal(imageUrl);
	};

	// Функция для закрытия модального окна
	const closeModal = () => {
		setImageModal(null);
	};

	const renderMessages = (messages, depth = 0) => {
		return messages.map((element) => {
			const backgroundColor = generateColor(element.name);
			return (
				<div key={element.id} style={{ marginLeft: `${depth * 20}px` }}>
					<div className={styles.chats}>
						<div className={styles.messageHeader}>
							<p className={styles.senderName}>
								{element.name === localStorage.getItem("user")
									? "Вы"
									: element.name}
							</p>
							<p className={styles.messageTime}>
								{formatDateTime(element.timestamp)}
							</p>
						</div>
						<div
							className={
								element.name === localStorage.getItem("user")
									? styles.messageSender
									: styles.messageRecipient
							}
							style={{ backgroundColor }}
						>
							{element.quotetext && (
								<div className={styles.quote}>
									<p>{truncateQuote(element.quotetext)}</p>
								</div>
							)}
							<div dangerouslySetInnerHTML={{ __html: element.text }} />

							{/* Отображаем изображение, если оно было загружено */}
							{element.imageUrl && (
								<div className={styles.mediaContainer}>
									<img
										src={`https://spa-app-websocket-server.up.railway.app/${element.imageUrl}`}
										alt='User upload'
										className={styles.messageImage}
										onClick={() =>
											handleImageClick(
												`https://spa-app-websocket-server.up.railway.app/${element.imageUrl}`
											)
										} // Увеличение картинки при клике
									/>
								</div>
							)}
							<br />

							{/* Отображаем ссылку на текстовый файл, если он был загружен */}
							{element.textFileUrl && (
								<div className={styles.mediaContainer}>
									<a
										href={`https://spa-app-websocket-server.up.railway.app/${element.textFileUrl}`}
										target='_blank'
										rel='noopener noreferrer'
										className={styles.textFileLink}
									>
										Открыть текстовый файл
									</a>
								</div>
							)}
						</div>
						<button
							onClick={() =>
								handleReply(element.id, element.name, element.text)
							}
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
			);
		});
	};

	return (
		<>
			<div className={styles.container}>
				{renderMainComments()}
				{renderMessages(messages)}
				<div className={styles.status}>
					<p>{status}</p>
				</div>
			</div>
			{totalPages > 1 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={loadMoreMessages}
				/>
			)}
			{/* Модальное окно для отображения увеличенного изображения */}
			{imageModal && (
				<div className={styles.modal} onClick={closeModal}>
					<div className={styles.modalContent}>
						<img src={imageModal} alt='Enlarged' />
					</div>
				</div>
			)}
		</>
	);
};

export default Body;
