const express = require('express');
const router = express.Router();
const { PostLike, Post } = require('../models');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/:postId/like', isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.session.userId;

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = await PostLike.findOne({ where: { user_id: userId, post_id: postId } });
    if (existingLike) {
      return res.status(400).json({ message: 'Already liked' });
    }

    // Create new like
    await PostLike.create({ user_id: userId, post_id: postId });

    // Update like count in the Post table
    const likeCount = await PostLike.count({ where: { post_id: postId } });
    await post.update({ likeCount });

    res.json({ message: 'Post liked', likes: likeCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

router.delete('/:postId/unlike', isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.session.userId;

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const like = await PostLike.findOne({ where: { user_id: userId, post_id: postId } });
    if (!like) {
      return res.status(400).json({ message: 'Like not found' });
    }

    // Remove the like
    await like.destroy();

    // Update like count in the Post table
    const likeCount = await PostLike.count({ where: { post_id: postId } });
    await post.update({ likeCount });

    res.json({ message: 'Like removed', likes: likeCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

module.exports = router;
