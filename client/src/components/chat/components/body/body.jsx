// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Pagination from "../pagination/pagination";
// import styles from "./styles.module.css";

// const Body = ({
// 	messages,
// 	status,
// 	socket,
// 	setReplyTo,
// 	currentPage,
// 	totalPages,
// 	loadMoreMessages,
// 	fetchSortedComments, // Добавляем новый проп
// }) => {
// 	const navigate = useNavigate();
// 	const [replyingTo, setReplyingTo] = useState(null);
// 	const [sortConfig, setSortConfig] = useState({
// 		key: "date",
// 		direction: "desc",
// 	});

// 	const handleLeave = () => {
// 		const user = localStorage.getItem("user");
// 		if (socket) {
// 			socket.emit("logout", { user, socketID: socket.id });
// 		}
// 		localStorage.removeItem("user");
// 		navigate("/");
// 	};

// 	const handleReply = (messageId, userName, text) => {
// 		setReplyingTo(messageId);
// 		setReplyTo({ id: messageId, text: text }); // Теперь передаем полный текст
// 		const messageInput = document.querySelector(".userMessage");
// 		if (messageInput) {
// 			messageInput.scrollIntoView({ behavior: "smooth" });
// 			messageInput.focus();
// 		}
// 	};

// 	// Функция для форматирования даты и времени
// 	const formatDateTime = (timestamp) => {
// 		const date = new Date(timestamp);
// 		return date.toLocaleString("ru-RU", {
// 			day: "2-digit",
// 			month: "2-digit",
// 			year: "numeric",
// 			hour: "2-digit",
// 			minute: "2-digit",
// 		});
// 	};

// 	// Функция для обрезки текста цитаты
// 	const truncateQuote = (text, maxLength = 100) => {
// 		if (text.length <= maxLength) return text;
// 		return text.slice(0, maxLength - 3) + "...";
// 	};

// 	const handleSort = (key) => {
// 		let direction = "asc";
// 		if (sortConfig.key === key && sortConfig.direction === "asc") {
// 			direction = "desc";
// 		}
// 		setSortConfig({ key, direction });

// 		let serverSortKey;
// 		switch (key) {
// 			case "username":
// 				serverSortKey = "name";
// 				break;
// 			case "email":
// 				serverSortKey = "email";
// 				break;
// 			case "date":
// 				serverSortKey = "timestamp";
// 				break;
// 			default:
// 				serverSortKey = "timestamp";
// 		}

// 		fetchSortedComments(serverSortKey, direction);
// 	};

// 	const renderTableHeader = () => (
// 		<thead>
// 			<tr>
// 				<th onClick={() => handleSort("username")}>
// 					User Name{" "}
// 					{sortConfig.key === "username" &&
// 						(sortConfig.direction === "asc" ? "▲" : "▼")}
// 				</th>
// 				<th onClick={() => handleSort("email")}>
// 					E-mail{" "}
// 					{sortConfig.key === "email" &&
// 						(sortConfig.direction === "asc" ? "▲" : "▼")}
// 				</th>
// 				<th onClick={() => handleSort("date")}>
// 					Date{" "}
// 					{sortConfig.key === "date" &&
// 						(sortConfig.direction === "asc" ? "▲" : "▼")}
// 				</th>
// 				<th>Message</th>
// 				<th>Actions</th>
// 			</tr>
// 		</thead>
// 	);

// 	const renderMainComments = () => (
// 		<table className={styles.commentsTable}>
// 			{renderTableHeader()}
// 			<tbody>
// 				{messages
// 					.filter((msg) => !msg.parentid)
// 					.map((element) => (
// 						<tr key={element.id}>
// 							<td>{element.name}</td>
// 							<td>{element.email}</td>
// 							<td>{formatDateTime(element.timestamp)}</td>
// 							<td>{truncateQuote(element.text)}</td>
// 							<td>
// 								<button
// 									onClick={() =>
// 										handleReply(element.id, element.name, element.text)
// 									}
// 								>
// 									Reply
// 								</button>
// 							</td>
// 						</tr>
// 					))}
// 			</tbody>
// 		</table>
// 	);

// 	// Функция, которая отвечает за отображение вложенных сообщений
// 	const renderMessages = (messages, depth = 0) => {
// 		return messages.map((element) => (
// 			<div key={element.id} style={{ marginLeft: `${depth * 20}px` }}>
// 				<div className={styles.chats}>
// 					<div className={styles.messageHeader}>
// 						<p className={styles.senderName}>
// 							{element.name === localStorage.getItem("user")
// 								? "Вы"
// 								: element.name}
// 						</p>
// 						<p className={styles.messageTime}>
// 							{formatDateTime(element.timestamp)}
// 						</p>
// 					</div>
// 					<div
// 						className={
// 							element.name === localStorage.getItem("user")
// 								? styles.messageSender
// 								: styles.messageRecipient
// 						}
// 					>
// 						{/* Проверка и отображение цитируемого текста */}
// 						{element.quotetext && (
// 							<div className={styles.quote}>
// 								<p>{truncateQuote(element.quotetext)}</p>{" "}
// 								{/* Ограничение по символам для цитаты */}
// 							</div>
// 						)}
// 						<p>{element.text}</p>
// 					</div>
// 					<button
// 						onClick={() => handleReply(element.id, element.name, element.text)}
// 					>
// 						Ответить
// 					</button>
// 					{replyingTo === element.id && (
// 						<span className={styles.replyingIndicator}>
// 							Отвечаем на это сообщение
// 						</span>
// 					)}
// 				</div>
// 				{element.replies &&
// 					element.replies.length > 0 &&
// 					renderMessages(element.replies, depth + 1)}
// 			</div>
// 		));
// 	};

// 	return (
// 		<>
// 			<header className={styles.header}>
// 				<button className={styles.btn} onClick={handleLeave}>
// 					Покинуть чат
// 				</button>
// 			</header>

// 			<div className={styles.container}>
// 				{renderMainComments()}
// 				{renderMessages(messages.filter((msg) => msg.parentid))}
// 				<div className={styles.status}>
// 					<p>{status}</p>
// 				</div>
// 			</div>
// 			{totalPages > 1 && (
// 				<Pagination
// 					currentPage={currentPage}
// 					totalPages={totalPages}
// 					onPageChange={loadMoreMessages}
// 				/>
// 			)}
// 		</>
// 	);
// };

// export default Body;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
	const navigate = useNavigate();
	const [replyingTo, setReplyingTo] = useState(null);
	const [sortConfig, setSortConfig] = useState({
		key: "date",
		direction: "desc",
	});

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
				{/* <th>Message</th>
				<th>Actions</th> */}
			</tr>
		</thead>
	);

	const renderMainComments = () => (
		<table className={styles.commentsTable}>{renderTableHeader()}</table>
	);

	const renderMessages = (messages, depth = 0) => {
		return messages.map((element) => (
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
					>
						{element.quotetext && (
							<div className={styles.quote}>
								<p>{truncateQuote(element.quotetext)}</p>
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
		</>
	);
};

export default Body;
