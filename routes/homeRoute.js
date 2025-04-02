const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Post, Category, PostLike, SavedPost, Comment } = require('../models');

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
        { model: SavedPost, as: 'SavedPosts', where: { user_id: req.session.userId }, required: false }, // Include saved posts
        { 
          model: Comment, 
          as: 'Comments',  // Include comments for each post
          include: {
            model: User,  // Include user to show the commenter's username
            as: 'User',
            attributes: ['username']
          }
        }
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
      saveCount: post.SavedPosts.length,
      savedByUser: post.SavedPosts.length > 0,
    }));

    // Render posts and categories
    res.render('welcome', { username: user.username, posts: postsWithLikesAndSaves, categories });
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading posts');
  }
});

module.exports = router;
