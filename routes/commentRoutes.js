const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { addComment, getComments, updateComment, deleteComment } = require("../controllers/commentController");

const router = express.Router();

// GET /api/comments/:postId
router.route("/:postId")
  .get(getComments)              // public: read comments of a post
  .post(protect, addComment);    // auth: add comment
  // UPDATE a comment
  router.put("/:commentId", protect, updateComment);

// DELETE /api/comments/delete/:commentId
router.delete("/delete/:commentId", protect, deleteComment);

module.exports = router;
