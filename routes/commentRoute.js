const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const commentsController = require('../controllers/commentsController');

router.post('/comment', isAuthenticated, commentsController.createComment);

router.get('/comments/:post_id', commentsController.getComments);

router.put('/comment/:comment_id', isAuthenticated, commentsController.updateComment);

router.delete('/comment/:comment_id', isAuthenticated, commentsController.deleteComment);

module.exports = router;
