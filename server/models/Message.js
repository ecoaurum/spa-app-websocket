const { db } = require("../config/db");

class Message {
	static async create(messageData) {
		const [result] = await db.query(
			`INSERT INTO messages (name, email, homepage, text, parentid, quotetext, imageUrl, textFileUrl) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				messageData.name,
				messageData.email,
				messageData.homepage || null,
				messageData.text,
				messageData.parentId || null,
				messageData.quotetext || null,
				messageData.imageUrl || null,
				messageData.textFileUrl || null,
			]
		);
		return result.insertId;
	}

	static async getPage(page, messagesPerPage) {
		const offset = (page - 1) * messagesPerPage;
		const [messages] = await db.query(
			"SELECT * FROM messages ORDER BY timestamp ASC LIMIT ? OFFSET ?",
			[messagesPerPage, offset]
		);
		return messages;
	}

	static async getCount() {
		const [rows] = await db.query("SELECT COUNT(*) AS count FROM messages");
		return rows[0].count;
	}

	static async getAll(orderBy = "timestamp", orderDirection = "DESC") {
		const [messages] = await db.query(
			`SELECT * FROM messages ORDER BY ${orderBy} ${orderDirection}`
		);
		return messages;
	}
}

module.exports = Message;
