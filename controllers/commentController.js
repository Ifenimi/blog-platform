const commentService = require("../services/commentService");

exports.addComment = async (req, res, next) => {
  try {
    const comment = await commentService.addComment({
      content: req.body.content,
      postId: req.params.postId,
      userId: req.user._id
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const updatedComment = await commentService.updateComment({
      commentId: req.params.commentId,
      user: req.user,
      content: req.body.content
    });
    res.json(updatedComment);
  } catch (err) {
    next(err);
  }
};


exports.getComments = async (req, res, next) => {
  try {
    const comments = await commentService.getCommentsByPost(req.params.postId);
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const result = await commentService.deleteComment(req.params.commentId, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
