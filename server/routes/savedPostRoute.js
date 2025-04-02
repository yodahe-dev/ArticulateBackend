const express = require('express');
const router = express.Router();
const { SavedPost } = require('../models');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Route to save a post
router.post('/:postId/save', isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.session.userId;

    // Check if the post is already saved by the user
    const existingSave = await SavedPost.findOne({ where: { user_id: userId, post_id: postId } });
    if (existingSave) {
      return res.status(400).json({ message: 'Post already saved' });
    }

    // Save the post
    await SavedPost.create({ user_id: userId, post_id: postId });

    // Count how many times the post has been saved
    const saveCount = await SavedPost.count({ where: { post_id: postId } });
    res.json({ message: 'Post saved', saves: saveCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save post' });
  }
});

// Route to remove a saved post
router.delete('/:postId/unsave', isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.session.userId;

    // Check if the post is saved by the user
    const save = await SavedPost.findOne({ where: { user_id: userId, post_id: postId } });
    if (!save) {
      return res.status(400).json({ message: 'Save not found' });
    }

    // Remove the save
    await save.destroy();

    // Count how many times the post has been saved after unsaving
    const saveCount = await SavedPost.count({ where: { post_id: postId } });
    res.json({ message: 'Post unsaved', saves: saveCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to unsave post' });
  }
});

module.exports = router;
