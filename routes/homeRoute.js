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
      limit: 3
    };

    if (categoryFilter) {
      postQuery.where.category_id = categoryFilter;
    }

    const posts = await Post.findAll(postQuery);
    const categories = await Category.findAll();

    const postsWithCounts = posts.map(post => {
      return {
        ...post.toJSON(),
        likeCount: post.PostLikes.length,
        saveCount: post.SavedPosts.length,
        likedByUser: post.PostLikes.some(like => like.user_id === req.session.userId),
        savedByUser: post.SavedPosts.length > 0,
      };
    });

    res.render('home', {
      username: user.username, 
      posts: postsWithCounts, 
      categories,
      title: 'Home'
    });

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
    const searchQuery = req.query.search || '';
    const postsPerPage = 9;
    const currentPage = parseInt(req.query.page, 10) || 1;

    // Construct query for posts with filters, pagination, and related models
    const postQuery = {
      where: {
        user_id: { [Op.ne]: req.session.userId },
        ...(categoryFilter ? { category_id: categoryFilter } : {}),
        ...(searchQuery ? { title: { [Op.iLike]: `%${searchQuery}%` } } : {}),  // Search filter
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
      offset: (currentPage - 1) * postsPerPage,
    };

    // Fetch posts, categories, and total post count for pagination
    const [posts, totalPosts, categories] = await Promise.all([
      Post.findAll(postQuery),
      Post.count({ where: postQuery.where }),  // Count posts with the same filters
      Category.findAll()
    ]);

    // Add like and save counts to posts
    const postsWithCounts = posts.map(post => ({
      ...post.toJSON(),
      likeCount: post.PostLikes.length,
      saveCount: post.SavedPosts.length,
      likedByUser: post.PostLikes.some(like => like.user_id === req.session.userId),
      savedByUser: post.SavedPosts.length > 0,
    }));

    // Render posts page with pagination and filters
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
      currentUser: user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading posts');
  }
});

router.get('/post/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    console.log('Post ID:', postId);  // Add this to check the value of postId

    // Fetch the post by ID, including category, likes, saved posts, and comments
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

    // Add like and save counts to the post
    const postWithCounts = {
      ...post.toJSON(),
      likeCount: post.PostLikes.length,
      saveCount: post.SavedPosts.length,
      likedByUser: post.PostLikes.some(like => like.user_id === req.session.userId),
      savedByUser: post.SavedPosts.length > 0,
    };

    // Render the post detail page with all data
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
