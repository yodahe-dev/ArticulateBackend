const express = require('express');
const router = express.Router();
const { Post, Category } = require('../models');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const posts = await Post.findAll({
            where: { user_id: req.session.userId },
            include: [{
                model: Category,
                as: 'category',  // Make sure to use the correct alias
                attributes: ['name']
            }],
            order: [['created_at', 'DESC']], // LIFO order (latest first)
        });

        res.render('profile', { username: req.session.username, posts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading profile');
    }
});

module.exports = router;
