const express = require('express');
const { Post, Category, PostLike, SavedPost, Comment, User } = require('../models');
const { Op } = require('sequelize');



router.get('/posts', async (req, res) => {
    if (!req.session.userId) {
      return res.redirect('/signup');
    }
  
    try {
      const user = await User.findByPk(req.session.userId);
      const categoryFilter = req.query.category;
      const searchQuery = req.query.search || '';
      const postsPerPage = 9;
      const currentPage = parseInt(req.query.page, 10) || 1;
  
      const postQuery = {
        where: {
          user_id: { [Op.ne]: req.session.userId },
        },
        include: [
          { model: Category, as: 'category', attributes: ['name'] },
          { model: PostLike, as: 'PostLikes' },
          { model: SavedPost, as: 'SavedPosts', where: { user_id: req.session.userId }, required: false },
          { 
            model: Comment, 
            as: 'Comments', 
            include: {
              model: User,
              as: 'User',
              attributes: ['username']
            }
          }
        ],
        order: [['created_at', 'DESC']],
        limit: postsPerPage,
        offset: (currentPage - 1) * postsPerPage
      };
  
      const [posts, totalPosts, categories] = await Promise.all([
        Post.findAll(postQuery),
        Post.count({ where: postQuery.where }),  // Count posts with the same filters
        Category.findAll()
      ]);
  
      const postsWithCounts = posts.map(post => ({
        ...post.toJSON(),
        likeCount: post.PostLikes.length,
        saveCount: post.SavedPosts.length,
        likedByUser: post.PostLikes.some(like => like.user_id === req.session.userId),
        savedByUser: post.SavedPosts.length > 0
      }));
  
      res.render('post', {
        username: user.username, 
        posts: postsWithCounts, 
        categories,
        title: 'Posts',
        totalPosts,
        postsPerPage,
        currentPage,
        searchQuery,  // Pass search query to the frontend
        categoryFilter,  // Add categoryFilter to the template context
        currentUser: user
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading posts');
    }
  });
  
  // Post detail route (ensure it's defined correctly)
  router.get('/post/:id', async (req, res) => {
    try {
      const postId = req.params.id;
  
      // Fetch the post along with its associated data (category, likes, saved posts, comments)
      const post = await Post.findByPk(postId, {
        include: [
          { model: Category, as: 'category', attributes: ['name'] },
          { model: PostLike, as: 'PostLikes' },
          { model: SavedPost, as: 'SavedPosts', where: { user_id: req.session.userId }, required: false },
          { 
            model: Comment, 
            as: 'Comments', 
            include: {
              model: User,
              as: 'User',
              attributes: ['username']
            }
          }
        ]
      });
  
      if (!post) {
        return res.status(404).send('Post not found');
      }
  
      // Prepare the data to be passed to the EJS template
      const postWithCounts = {
        ...post.toJSON(),
        likeCount: post.PostLikes.length,
        saveCount: post.SavedPosts.length,
        likedByUser: post.PostLikes.some(like => like.user_id === req.session.userId),
        savedByUser: post.SavedPosts.length > 0
      };
  
      res.render('post-detail', {
        post: postWithCounts,
        title: post.title,
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching post details');
    }
  });

  module.exports = router;