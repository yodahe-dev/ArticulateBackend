const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Post, Category, PostLike, SavedPost } = require('../models');

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
        { model: PostLike, as: 'PostLikes' }, // Include likes
        { model: SavedPost, as: 'SavedPosts', where: { user_id: req.session.userId }, required: false } // Include saved posts
      ],
      order: [['created_at', 'DESC']],
    };

    if (categoryFilter) {
      postQuery.where.category_id = categoryFilter;
    }

    const posts = await Post.findAll(postQuery);
    const categories = await Category.findAll();

    // Map posts to include like count, saved count, check if user liked, and check if the user has saved the post
    const postsWithLikesAndSaves = posts.map(post => ({
      ...post.toJSON(),
      likeCount: post.PostLikes.length,
      likedByUser: post.PostLikes.some(like => like.user_id === req.session.userId),
      saveCount: post.SavedPosts.length, // Count of how many times this post has been saved
      savedByUser: post.SavedPosts.length > 0, // Check if the user has saved the post
    }));

    res.render('welcome', { username: user.username, posts: postsWithLikesAndSaves, categories });
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading posts');
  }
});

module.exports = router;
