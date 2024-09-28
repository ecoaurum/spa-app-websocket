import React, { useEffect, useState } from "react";
import SideBar from "./components/sidebar/sidebar";
import Body from "./components/body/body";
import MessageBlock from "./components/message-block/message-block";
import styles from "./styles.module.css";

const ChatPage = ({ socket }) => {
	const [messages, setMessages] = useState([]);
	const [status, setStatus] = useState("");
	const [replyTo, setReplyTo] = useState(null);

	useEffect(() => {
		socket.on("response", (data) => {
			setMessages((prevMessages) => {
				if (data.parentId) {
					// Если это ответ, найдем родительское сообщение и добавим ответ
					return updateMessagesWithReply(prevMessages, data);
				} else {
					// Если это новое сообщение, добавляем его в конец списка
					return [...prevMessages, data];
				}
			});
		});

		socket.on("responseTyping", (data) => {
			setStatus(data);
			setTimeout(() => setStatus(""), 1000);
		});

		return () => {
			socket.off("response");
			socket.off("responseTyping");
		};
	}, [socket]);

	// Функция для обновления сообщений с ответом
	const updateMessagesWithReply = (messages, newReply) => {
		return messages.map((msg) => {
			if (msg.id === newReply.parentId) {
				return { ...msg, replies: [...(msg.replies || []), newReply] };
			}
			if (msg.replies) {
				return {
					...msg,
					replies: updateMessagesWithReply(msg.replies, newReply),
				};
			}
			return msg;
		});
	};

	return (
		<div className={styles.chat}>
			<SideBar socket={socket} />
			<main className={styles.main}>
				<Body
					messages={messages}
					status={status}
					socket={socket}
					setReplyTo={setReplyTo}
				/>
				<MessageBlock
					socket={socket}
					replyTo={replyTo}
					setReplyTo={setReplyTo}
				/>
			</main>
		</div>
	);
};

export default ChatPage;
