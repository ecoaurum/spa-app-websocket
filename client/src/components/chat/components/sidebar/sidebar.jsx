import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";

const SideBar = ({ socket }) => {
	const [users, setUsers] = useState([]);

	useEffect(() => {
		// Обновляем список пользователей при получении данных с сервера
		socket.on("responseNewUser", (data) => setUsers(data));
	}, [socket]);

	const filteredList = users.filter(
		(value, index, self) =>
			index ===
			self.findIndex(
				(t) => t.user === value.user && t.socketID === value.socketID
			)
	);
	return (
		<div className={styles.sidebar}>
			<h4 className={styles.header}> Users</h4>
			<ul className={styles.users}>
				{filteredList.map((element) => (
					<li key={element.socketID}>{element.user}</li>
				))}
			</ul>
		</div>
	);
};

export default SideBar;
