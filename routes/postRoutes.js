const express = require("express");
const multer = require("multer");
const path = require("path");
const { protect } = require("../middlewares/authMiddleware");
const { createPost, getPosts, getPost, updatePost, deletePost } = require("../controllers/postController");

const router = express.Router();

// Multer config - store in /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};
const upload = multer({ storage, fileFilter });

router.route("/")
  .get(getPosts)
  .post(protect, upload.single("image"), createPost);

router.route("/:id")
  .get(getPost)
  .put(protect, upload.single("image"), updatePost)
  .delete(protect, deletePost);

module.exports = router;
