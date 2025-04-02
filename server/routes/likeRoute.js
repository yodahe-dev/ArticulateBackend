const express = require('express');
const router = express.Router();
const { PostLike } = require('../models');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/:postId/like', isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.session.userId;

    const existingLike = await PostLike.findOne({ where: { user_id: userId, post_id: postId } });
    if (existingLike) {
      return res.status(400).json({ message: 'Already liked' });
    }

    await PostLike.create({ user_id: userId, post_id: postId });

    const likeCount = await PostLike.count({ where: { post_id: postId } });
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

    const like = await PostLike.findOne({ where: { user_id: userId, post_id: postId } });
    if (!like) {
      return res.status(400).json({ message: 'Like not found' });
    }

    await like.destroy();
    const likeCount = await PostLike.count({ where: { post_id: postId } });
    
    res.json({ message: 'Like removed', likes: likeCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

module.exports = router;
