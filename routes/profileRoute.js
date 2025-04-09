const fs = require('fs');
const express = require('express');
const router = express.Router();
const { Post, Category, User, PostLike, SavedPost } = require('../models');
const { isAuthenticated } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const filter = req.query.filter || 'all';
    const currentPage = parseInt(req.query.page) || 1; // Default to page 1
    const postsPerPage = 9; // Number of posts per page
    const offset = (currentPage - 1) * postsPerPage;

    // Fetch user details
    const user = await User.findByPk(userId, { include: ['Role'] });

    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/');
    }

    const categories = await Category.findAll();

    let posts = [];
    let totalPosts = 0; // To store total posts count

    if (filter === 'liked') {
      // Liked posts
      const liked = await PostLike.findAll({ where: { user_id: userId } });
      const likedPostIds = liked.map(l => l.post_id);
      posts = await Post.findAll({
        where: { post_id: likedPostIds },
        include: [{ model: Category, as: 'category' }],
        order: [['created_at', 'DESC']],
        limit: postsPerPage,
        offset: offset
      });
    } else if (filter === 'saved') {
      // Saved posts
      const saved = await SavedPost.findAll({ where: { user_id: userId } });
      const savedPostIds = saved.map(s => s.post_id);
      posts = await Post.findAll({
        where: { post_id: savedPostIds },
        include: [{ model: Category, as: 'category' }],
        order: [['created_at', 'DESC']],
        limit: postsPerPage,
        offset: offset
      });
    } else {
      // Own posts
      posts = await Post.findAll({
        where: { user_id: userId },
        include: [{ model: Category, as: 'category' }],
        order: [['created_at', 'DESC']],
        limit: postsPerPage,
        offset: offset
      });
    }

    // Fetch total posts count regardless of filter
    totalPosts = await Post.count({ where: { user_id: userId } });

    // Like and Save counts
    const likeCount = await PostLike.count({ where: { user_id: userId } });
    const saveCount = await SavedPost.count({ where: { user_id: userId } });

    const totalPages = Math.ceil(totalPosts / postsPerPage); // Calculate total pages

    res.render('profile', {
      user,
      username: user.username,
      email: user.email,
      user_role: user.Role?.role_name || 'user',
      posts: posts.map(p => p.toJSON()),
      categories,
      likeCount,
      saveCount,
      totalPosts,        // Total posts count
      totalPages,        // Total pages for pagination
      currentPage,       // Current page number
      filter,
      success: req.flash('success'),
      error: req.flash('error'),
      title: 'Profile'
    });

  } catch (err) {
    console.error('Profile Error:', err);
    req.flash('error', 'Failed to load profile');
    res.redirect('/');
  }
});
// 🗑️ Delete post

const path = require('path');

// Check if user is authenticated and is an admin
const isAdmin = (req, res, next) => {
  if (req.session.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied' });
};

// Delete Post Route
router.delete('/delete-post/:id', isAuthenticated, isAdmin, async (req, res) => {
  const userId = req.session.userId;
  const postId = req.params.id;

  try {
    // Check if post exists
    const post = await Post.findOne({ where: { post_id: postId } });

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // If the user is not an admin, ensure they can only delete their own posts
    if (req.session.role !== 'admin' && post.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own posts' });
    }

    // Delete image if it's not the default image
    if (post.thumbnail_url && post.thumbnail_url !== '/uploads/default-post.jpg') {
      const filePath = path.join(__dirname, '..', 'public', post.thumbnail_url);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
        else console.log('Image deleted successfully');
      });
    }

    // Delete the post
    await post.destroy();
    res.status(200).json({ success: true, message: 'Post deleted successfully' });

  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Edit Post Route - Admin can edit any post, others can only edit their own posts
router.get('/edit/:id', isAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const userId = req.session.userId;

  try {
    const post = await Post.findOne({
      where: { post_id: postId },
      include: [{ model: Category, as: 'category' }]
    });

    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/profile');
    }

    // Admin can edit any post, but users can only edit their own posts
    if (req.session.role !== 'admin' && post.user_id !== userId) {
      req.flash('error', 'You can only edit your own posts');
      return res.redirect('/profile');
    }

    const categories = await Category.findAll();

    res.render('edit', {
      post: post.toJSON(),
      categories,
      title: 'Edit Post'
    });

  } catch (err) {
    console.error('Edit GET error:', err);
    req.flash('error', 'Error loading edit page');
    res.redirect('/profile');
  }
});

// Submit Post Edit Route
router.post('/edit-post', isAuthenticated, upload.single('thumbnail'), async (req, res) => {
  try {
    const { id, title, content, category_id } = req.body;
    const userId = req.session.userId;

    const post = await Post.findOne({
      where: { post_id: id }
    });

    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/profile');
    }

    // Admin can edit any post, but users can only edit their own posts
    if (req.session.role !== 'admin' && post.user_id !== userId) {
      req.flash('error', 'You can only edit your own posts');
      return res.redirect('/profile');
    }

    post.title = title;
    post.content = content;
    post.category_id = category_id;

    // Update thumbnail if a new one is uploaded
    if (req.file) {
      if (post.thumbnail_url && post.thumbnail_url !== '/uploads/default-post.jpg') {
        const oldPath = path.join(__dirname, '..', 'public', post.thumbnail_url);
        fs.unlink(oldPath, err => { if (err) console.error('Image delete error:', err); });
      }
      post.thumbnail_url = `/uploads/${req.file.filename}`;
    }

    await post.save();
    req.flash('success', 'Post updated');
    res.redirect('/profile');

  } catch (err) {
    console.error('Edit POST error:', err);
    req.flash('error', 'Update failed');
    res.redirect('/profile');
  }
});


module.exports = router;
