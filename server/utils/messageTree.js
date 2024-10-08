function buildMessageTree(messages) {
	const messageMap = new Map();
	const roots = [];

	// First pass: create a map of all messages
	messages.forEach((msg) => {
		msg.replies = [];
		messageMap.set(msg.id, msg);
	});

	// Second pass: build the tree
	messages.forEach((msg) => {
		if (msg.parentid) {
			const parent = messageMap.get(msg.parentid);
			if (parent) {
				parent.replies.push(msg);
			} else {
				// If parent not found, add as a root message
				roots.push(msg);
			}
		} else {
			roots.push(msg);
		}
	});

	return roots; // Return root messages with nested replies
}

module.exports = { buildMessageTree };
