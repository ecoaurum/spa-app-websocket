import React, { useEffect, useState } from "react";
import SideBar from "./components/sidebar/sidebar";
import Body from "./components/body/body";
import MessageBlock from "./components/message-block/message-block";
import styles from "./styles.module.css";

const ChatPage = ({ socket }) => {
	const [messages, setMessages] = useState([]);
	const [status, setStatus] = useState("");

	// Обработка получения новых сообщений
	useEffect(() => {
		socket.on("response", (data) => setMessages([...messages, data]));
	}, [socket, messages]);

	useEffect(() => {
		socket.on("responseTyping", (data) => {
			setStatus(data);
			setTimeout(() => {
				setStatus("");
			}, 1000);
		});
	}, [socket]);

	return (
		<div className={styles.chat}>
			<SideBar socket={socket} />
			<main className={styles.main}>
				<Body messages={messages} status={status} socket={socket} />
				<MessageBlock socket={socket} />
			</main>
		</div>
	);
};

export default ChatPage;
