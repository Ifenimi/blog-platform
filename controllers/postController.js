const postService = require("../services/postService");

exports.createPost = async (req, res, next) => {
  try {
    const payload = {
      title: req.body.title,
      content: req.body.content,
      author: req.user._id,
      image: req.file ? req.file.path.replace(/\\/g, "/") : undefined
    };
    const post = await postService.createPost(payload);
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await postService.getPosts();
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await postService.getPostById(req.params.id);
    res.json(post);
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const updates = {
      title: req.body.title,
      content: req.body.content
    };
    if (req.file) updates.image = req.file.path.replace(/\\/g, "/");
    const post = await postService.updatePost(req.params.id, updates, req.user);
    res.json(post);
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const result = await postService.deletePost(req.params.id, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
