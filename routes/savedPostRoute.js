const express = require('express');
const router = express.Router();
const { SavedPost, Post } = require('../models');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Save a post
router.post('/:postId/save', isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.session.userId;

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingSave = await SavedPost.findOne({ where: { user_id: userId, post_id: postId } });
    if (existingSave) {
      return res.status(400).json({ message: 'Post already saved' });
    }

    // Create new save
    await SavedPost.create({ user_id: userId, post_id: postId });

    // Update save count in the Post table
    const saveCount = await SavedPost.count({ where: { post_id: postId } });
    await post.update({ saveCount });

    res.json({ message: 'Post saved', saves: saveCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save post' });
  }
});

// Unsave a post
router.delete('/:postId/unsave', isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.session.userId;

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const save = await SavedPost.findOne({ where: { user_id: userId, post_id: postId } });
    if (!save) {
      return res.status(400).json({ message: 'Save not found' });
    }

    // Remove the save
    await save.destroy();

    // Update save count in the Post table
    const saveCount = await SavedPost.count({ where: { post_id: postId } });
    await post.update({ saveCount });

    res.json({ message: 'Post unsaved', saves: saveCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to unsave post' });
  }
});

// Check if user has saved a post
router.get('/:postId/save-status', isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.session.userId;

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has saved this post
    const existingSave = await SavedPost.findOne({ where: { user_id: userId, post_id: postId } });
    const saveCount = await SavedPost.count({ where: { post_id: postId } });

    res.json({
      isSaved: !!existingSave, // true if saved, false otherwise
      saves: saveCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check save status' });
  }
});

module.exports = router;
