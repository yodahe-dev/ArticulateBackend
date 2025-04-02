const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Post, Category, PostLike } = require('../models');

router.get('/', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/signup');
  }

  try {
    const user = await User.findByPk(req.session.userId);
    const categoryFilter = req.query.category;

    // Fetch posts, filter by category if needed
    const postQuery = {
      where: {
        user_id: { [Op.ne]: req.session.userId },
      },
      include: [
        { model: Category, as: 'category', attributes: ['name'] },
        { model: PostLike, as: 'PostLikes' }, // Use 'PostLikes' instead of 'likes'
      ],
      order: [['created_at', 'DESC']],
    };

    if (categoryFilter) {
      postQuery.where.category_id = categoryFilter;
    }

    const posts = await Post.findAll(postQuery);
    const categories = await Category.findAll();

    // Map posts to include like count and check if user liked
    const postsWithLikes = posts.map(post => ({
      ...post.toJSON(),
      likeCount: post.PostLikes.length,
      likedByUser: post.PostLikes.some(like => like.user_id === req.session.userId),
    }));

    res.render('welcome', { username: user.username, posts: postsWithLikes, categories });
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading posts');
  }
});

module.exports = router;
