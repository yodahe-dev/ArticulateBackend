const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const commentsController = require('../controllers/commentsController');

// Create Comment (POST)
router.post('/comment', isAuthenticated, commentsController.createComment);

// Get Comments (for a post)
router.get('/comments/:post_id', commentsController.getComments);

// Update Comment (PUT)
router.put('/comment/:comment_id', isAuthenticated, commentsController.updateComment);

// Delete Comment (DELETE)
router.delete('/comment/:comment_id', isAuthenticated, commentsController.deleteComment);

module.exports = router;
