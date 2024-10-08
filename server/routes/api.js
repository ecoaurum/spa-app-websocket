const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { generateCaptcha } = require("../controllers/captchaController");
const { uploadImage, uploadFile } = require("../controllers/fileController");
const { getMainComments } = require("../controllers/messageController");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const dir = "./uploads";
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
		cb(null, "uploads/");
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

const upload = multer({
	storage: storage,
	fileFilter: function (req, file, cb) {
		const filetypes = /jpeg|jpg|png|gif|txt/;
		const extname = filetypes.test(
			path.extname(file.originalname).toLowerCase()
		);
		const mimetype = file.mimetype;

		if (extname && mimetype) {
			if (mimetype === "text/plain") {
				if (file.size > 100 * 1024) {
					return cb(new Error("Text file exceeds 100KB"));
				}
			} else if (/image\/(jpeg|png|gif)/.test(mimetype)) {
				if (file.size > 1 * 1024 * 1024) {
					return cb(new Error("Image file exceeds 1MB"));
				}
			}
			return cb(null, true);
		}
		cb(new Error("Invalid file type. Only images and text files are allowed."));
	},
});

router.get("/captcha", generateCaptcha);
router.post("/upload-image", upload.single("image"), uploadImage);
router.post("/upload-file", upload.single("file"), uploadFile);
router.get("/main-comments", async (req, res) => {
	try {
		const { sort, order } = req.query;
		const comments = await getMainComments(sort, order);
		res.json(comments);
	} catch (error) {
		console.error("Error getting comments:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

module.exports = router;
