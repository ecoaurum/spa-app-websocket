import React, { useEffect, useState } from "react";
import Body from "./components/body/body";
import MessageBlock from "./components/message-block/message-block";
import styles from "./styles.module.css";

const ChatPage = ({ socket }) => {
	const [messages, setMessages] = useState([]);
	const [status, setStatus] = useState("");
	const [replyTo, setReplyTo] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		socket.on("response", (data) => {
			setMessages((prevMessages) => {
				if (data.parentId) {
					return updateMessagesWithReply(prevMessages, data);
				} else {
					return [...prevMessages, data];
				}
			});
		});

		socket.emit("getMessages", 1);

		socket.on("messagesPage", (data) => {
			setMessages(data.messages);
			setTotalPages(data.totalPages);
			setCurrentPage(data.currentPage);
		});

		socket.on("newMessage", (data) => {
			setMessages((prevMessages) => {
				if (data.newMessage.parentId) {
					return updateMessagesWithReply(prevMessages, data.newMessage);
				} else {
					return [...prevMessages, data.newMessage];
				}
			});
		});

		return () => {
			socket.off("messagesPage");
			socket.off("response");
			socket.off("newMessage");
		};
	}, [socket]);

	const handlePageChange = (page) => {
		socket.emit("getMessages", page);
	};

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

	const fetchSortedComments = async (sort, order) => {
		try {
			const response = await fetch(
				`http://localhost:5000/api/main-comments?sort=${sort}&order=${order}`
			);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			setMessages(data);
		} catch (error) {
			console.error("Failed to fetch sorted comments:", error);
		}
	};

	return (
		<div className={styles.chat}>
			<main className={styles.main}>
				<Body
					messages={messages}
					status={status}
					socket={socket}
					setReplyTo={setReplyTo}
					currentPage={currentPage}
					totalPages={totalPages}
					loadMoreMessages={handlePageChange}
					fetchSortedComments={fetchSortedComments}
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
