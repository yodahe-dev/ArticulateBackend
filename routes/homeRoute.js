const express = require('express');
const { Post, Category, PostLike, SavedPost, Comment, User } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

router.get('/', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/signup');
  }

  try {
    const user = await User.findByPk(req.session.userId);
    const categoryFilter = req.query.category;

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
      limit: 3  // Limit to the latest 3 posts
    };

    if (categoryFilter) {
      postQuery.where.category_id = categoryFilter;
    }

    const posts = await Post.findAll(postQuery);
    const categories = await Category.findAll();

    // Calculate likeCount and saveCount
    const postsWithCounts = posts.map(post => {
      return {
        ...post.toJSON(),
        likeCount: post.PostLikes.length,
        saveCount: post.SavedPosts.length,
        likedByUser: post.PostLikes.some(like => like.user_id === req.session.userId),
        savedByUser: post.SavedPosts.length > 0,
      };
    });

    // Render posts and categories with like and save counts
    res.render('home', { username: user.username, posts: postsWithCounts, categories });
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading posts');
  }
});

router.get('/posts', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/signup');
  }

  try {
    const user = await User.findByPk(req.session.userId);
    const categoryFilter = req.query.category;

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

    // Calculate likeCount and saveCount
    const postsWithCounts = posts.map(post => {
      return {
        ...post.toJSON(),
        likeCount: post.PostLikes.length,
        saveCount: post.SavedPosts.length,
        likedByUser: post.PostLikes.some(like => like.user_id === req.session.userId),
        savedByUser: post.SavedPosts.length > 0,
      };
    });

    // Render posts and categories with like and save counts
    res.render('post', { username: user.username, posts: postsWithCounts, categories });
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading posts');
  }
});


module.exports = router;
