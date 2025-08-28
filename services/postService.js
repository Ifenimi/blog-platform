const Post = require("../models/Post");

exports.createPost = async (data) => {
  const post = await Post.create(data);
  return post;
};

exports.getPosts = async (query = {}) => {
  const posts = await Post.find(query).sort({ createdAt: -1 }).populate("author", "name email role");
  return posts;
};

exports.getPostById = async (id) => {
  const post = await Post.findById(id).populate("author", "name email role");
  if (!post) {
    const err = new Error("Post not found");
    err.statusCode = 404;
    throw err;
  }
  return post;
};

exports.updatePost = async (id, updates, user) => {
  const post = await Post.findById(id);
  if (!post) {
    const err = new Error("Post not found");
    err.statusCode = 404;
    throw err;
  }
  const isOwner = post.author.toString() === user._id.toString();
  if (!isOwner && user.role !== "admin") {
    const err = new Error("Not authorized to update this post");
    err.statusCode = 403;
    throw err;
  }

  if (updates.title !== undefined) post.title = updates.title;
  if (updates.content !== undefined) post.content = updates.content;
  if (updates.image !== undefined) post.image = updates.image;

  await post.save();
  return post;
};

exports.deletePost = async (id, user) => {
  const post = await Post.findById(id);
  if (!post) {
    const err = new Error("Post not found");
    err.statusCode = 404;
    throw err;
  }
  const isOwner = post.author.toString() === user._id.toString();
  if (!isOwner && user.role !== "admin") {
    const err = new Error("Not authorized to delete this post");
    err.statusCode = 403;
    throw err;
  }
  await post.deleteOne();
  return { message: "Post deleted" };
};
