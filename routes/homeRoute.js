const express = require('express');
const { Post, Category, PostLike, SavedPost, Comment, User } = require('../models');
const { Op } = require('sequelize');
const Fuse = require('fuse.js');

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
        ...(searchQuery ? { 
          [Op.or]: [
            { title: { [Op.like]: `%${searchQuery}%` } },
            { content: { [Op.like]: `%${searchQuery}%` } }
          ]
        } : {}),
      },
      include: [
        { model: Category, as: 'category', attributes: ['name'] },
        { model: PostLike, as: 'PostLikes' },
        { model: SavedPost, as: 'SavedPosts', where: { user_id: req.session.userId }, required: false },
        { model: Comment, as: 'Comments', include: { model: User, as: 'User', attributes: ['username'] } },
      ],
      order: [['created_at', 'DESC']],
      limit: postsPerPage,
      offset: (currentPage - 1) * postsPerPage,
    };

    const [posts, totalPosts, categories] = await Promise.all([
      Post.findAll(postQuery),
      Post.count({ where: postQuery.where }),
      Category.findAll(),
    ]);

    // If the request is an AJAX request, return posts as JSON
    const postsWithCounts = posts.map(post => {
      return {
        ...post.toJSON(),
        likeCount: post.PostLikes.length,
        saveCount: post.SavedPosts.length,
        likedByUser: post.PostLikes.some(like => like.user_id === req.session.userId),
        savedByUser: post.SavedPosts.length > 0,
      };
    });

    // Perform fuzzy search only if the searchQuery is provided
    let relatedPosts = [];
    if (searchQuery) {
      const fuseOptions = {
        keys: ['title', 'content'],
        threshold: 0.3, // Adjust the threshold as needed
      };

      const fuse = new Fuse(postsWithCounts, fuseOptions);
      const results = fuse.search(searchQuery);
      relatedPosts = results.map(result => result.item);
    }

    // If related posts are found, merge them with the posts being returned
    const combinedPosts = relatedPosts.length > 0 ? relatedPosts : postsWithCounts;

    // Return posts (with related content) if no search was provided
    if (req.xhr) {
      return res.json({ posts: combinedPosts });
    }

    // Render the posts (including related content) on the page
    res.render('post', {
      username: user.username,
      posts: combinedPosts,
      categories,
      title: 'Posts',
      totalPosts,
      postsPerPage,
      currentPage,
      searchQuery,
      categoryFilter,
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
