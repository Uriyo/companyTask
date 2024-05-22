const Post = require('../models/postModel');
const cloudinary = require('../cloudinaryConfig');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social_media_posts',
    format: async (req, file) => 'jpeg', // supports promises as well
    public_id: (req, file) => `${file.fieldname}-${Date.now()}`
  }
});

const upload = multer({ storage: storage });

// Post CRUD Operations
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;
    console.log(userId);
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'social_media_posts',
      use_filename: true,
      unique_filename: false
    });

    const imageUrl = result.secure_url;
    
    const post = await Post.create({ user: userId, content, image: imageUrl });
    res.status(201).json(post);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'username').populate('comments.user', 'username');
    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const image = req.file ? req.file.path : null;
    const updateData = { content };
    if (image) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'social_media_posts',
        use_filename: true,
        unique_filename: false
      });
      updateData.image = result.secure_url;
    }
    const post = await Post.findByIdAndUpdate(postId, updateData, { new: true });
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Like and Comment APIs
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    console.log(req.user);
    const userId = req.user.id;
    
    const post = await Post.findById(postId);
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const post = await Post.findById(postId);
    post.comments.push({ user: userId, content });
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Middleware for handling image uploads
exports.upload = upload.single('image');
