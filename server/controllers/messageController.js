const Message = require("../models/Message");
const { buildMessageTree } = require("../utils/messageTree");
const { sanitizeMessage } = require("../middlewares/sanitize");

const MESSAGES_PER_PAGE = 25;

exports.createMessage = async (messageData) => {
	const sanitizedText = sanitizeMessage(messageData.text);
	const sanitizedQuoteText = sanitizeMessage(messageData.quotetext || "");

	const newMessageId = await Message.create({
		...messageData,
		text: sanitizedText,
		quotetext: sanitizedQuoteText,
	});

	return {
		id: newMessageId,
		...messageData,
		text: sanitizedText,
		quotetext: sanitizedQuoteText,
		timestamp: new Date().toISOString(),
	};
};

exports.addMessage = async (messageData) => {
	const sanitizedText = sanitizeMessage(messageData.text);
	const sanitizedQuoteText = sanitizeMessage(messageData.quotetext || "");
	const newMessageId = await Message.create({
		...messageData,
		text: sanitizedText,
		quotetext: sanitizedQuoteText,
	});
	return newMessageId;
};

exports.getMessagesPage = async (page) => {
	const messages = await Message.getPage(page, MESSAGES_PER_PAGE);
	return buildMessageTree(messages);
};

exports.getTotalPages = async () => {
	const totalMessages = await Message.getCount();
	return Math.ceil(totalMessages / MESSAGES_PER_PAGE);
};

exports.getMainComments = async (sort, order) => {
	let orderBy = "timestamp";
	if (sort === "username") orderBy = "name";
	else if (sort === "email") orderBy = "email";
	else if (sort === "date") orderBy = "timestamp";

	const orderDirection = order === "asc" ? "ASC" : "DESC";
	const allMessages = await Message.getAll(orderBy, orderDirection);
	return buildMessageTree(allMessages);
};
