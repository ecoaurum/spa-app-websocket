const path = require("path");
const fs = require("fs").promises;
const sharp = require("sharp");

exports.uploadImage = async (req, res) => {
	if (!req.file) {
		return res.status(400).send({ message: "No file uploaded" });
	}
	const filePath = req.file.path;
	const resizedFilePath = `uploads/resized_${req.file.filename}`;

	try {
		await sharp(filePath)
			.resize(320, 240, { fit: sharp.fit.inside, withoutEnlargement: true })
			.toFile(resizedFilePath);

		setTimeout(async () => {
			try {
				await fs.access(filePath);
				await fs.unlink(filePath);
			} catch (err) {
				console.error("Error deleting file:", err);
			}
		}, 1000);

		res.status(200).json({ imageUrl: `/uploads/resized_${req.file.filename}` });
	} catch (error) {
		console.error("Error processing image:", error);
		res.status(500).json({ message: "Error processing image" });
	}
};

exports.uploadFile = async (req, res) => {
	if (!req.file) {
		return res.status(400).send({ message: "No file uploaded" });
	}

	const filePath = req.file.path;
	const fileSize = req.file.size;

	try {
		if (
			path.extname(filePath).toLowerCase() === ".txt" &&
			fileSize > 100 * 1024
		) {
			await fs.unlink(filePath);
			return res.status(400).json({ message: "Text file exceeds 100KB" });
		}

		console.log("Text file uploaded to:", filePath);
		res.status(200).json({ fileUrl: `/uploads/${req.file.filename}` });
	} catch (error) {
		console.error("Error uploading file:", error);
		res.status(500).json({ message: "Error uploading file" });
	}
};
