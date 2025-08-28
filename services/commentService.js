const Comment = require("../models/Comment");
const Post = require("../models/Post");

exports.addComment = async ({ content, postId, userId }) => {
  const post = await Post.findById(postId);
  if (!post) {
    const err = new Error("Post not found");
    err.statusCode = 404;
    throw err;
  }
  const comment = await Comment.create({ content, post: postId, user: userId });
  return comment.populate("user", "name email");
};

exports.getCommentsByPost = async (postId) => {
  const comments = await Comment.find({ post: postId }).sort({ createdAt: -1 }).populate("user", "name email");
  return comments;
};


exports.updateComment = async ({ commentId, user, content }) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    const err = new Error("Comment not found");
    err.statusCode = 404;
    throw err;
  }

  // Only allow creator or admin to update
  if (comment.user.toString() !== user._id.toString() && user.role !== "admin") {
    const err = new Error("Not authorized to update this comment");
    err.statusCode = 403;
    throw err;
  }

  comment.content = content;
  await comment.save();

  return comment;
};



exports.deleteComment = async (commentId, user) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    const err = new Error("Comment not found");
    err.statusCode = 404;
    throw err;
  }
  const isOwner = comment.user.toString() === user._id.toString();
  if (!isOwner && user.role !== "admin") {
    const err = new Error("Not authorized to delete this comment");
    err.statusCode = 403;
    throw err;
  }
  await comment.deleteOne();
  return { message: "Comment deleted" };
};
