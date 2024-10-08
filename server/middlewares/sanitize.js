const sanitizeHtml = require("sanitize-html");

const sanitizeOptions = {
	allowedTags: ["a", "code", "i", "strong"],
	allowedAttributes: {
		a: ["href", "title"],
	},
	allowedSchemes: ["http", "https"],
};

function sanitizeMessage(text) {
	return sanitizeHtml(text, sanitizeOptions);
}

module.exports = { sanitizeMessage };
