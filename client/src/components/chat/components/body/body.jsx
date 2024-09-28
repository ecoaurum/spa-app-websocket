import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const Body = ({ messages, status, socket }) => {
	const navigate = useNavigate();

	const handleLeave = () => {
		const user = localStorage.getItem("user");
		// Проверка, если socket не передан
		if (!socket) {
			console.error("Socket not found!");
			return;
		}
		const socketID = socket.id;

		// Эмитим событие logout, чтобы сервер удалил пользователя из списка
		socket.emit("logout", { user, socketID });

		localStorage.removeItem("user"); // Удаляем данные пользователя из localStorage
		navigate("/"); // Перенаправляем на главную страницу
	};

	// Эффект, который срабатывает при обновлении списка сообщений
	useEffect(() => {
		// Скроллим страницу вниз каждый раз, когда добавляется новое сообщение
		window.scrollTo(0, document.body.scrollHeight);
	}, [messages]); // Зависимость от изменений в массиве сообщений

	return (
		<>
			<header className={styles.header}>
				<button className={styles.btn} onClick={handleLeave}>
					Покинуть чат
				</button>
			</header>

			<div className={styles.container}>
				{messages.map((element) =>
					element.name === localStorage.getItem("user") ? (
						<div className={styles.chats} key={element.id}>
							<p className={styles.senderName}>Вы</p>
							<div className={styles.messageSender}>
								<p>{element.text}</p>
							</div>
						</div>
					) : (
						<div className={styles.chats} key={element.id}>
							<p>{element.name}</p>
							<div className={styles.messageRecipient}>
								<p>{element.text}</p>
							</div>
						</div>
					)
				)}

				<div className={styles.status}>
					<p>{status}</p>
				</div>
			</div>
		</>
	);
};

export default Body;
