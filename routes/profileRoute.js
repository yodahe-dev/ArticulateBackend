const fs = require('fs');
const express = require('express');
const router = express.Router();
const path = require('path');
const { Post, Category, User, PostLike, SavedPost } = require('../models');
const { isAuthenticated } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Profile page with dynamic tab handling
router.get(['/', '/liked', '/saved'], isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const currentPath = req.originalUrl;
    const user = await User.findByPk(userId, { include: ['Role'] });
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/');
    }

    let posts = [];
    const categories = await Category.findAll();

    if (currentPath === '/profile/liked') {
      const likes = await PostLike.findAll({
        where: { user_id: userId },
        include: { model: Post, as: 'post', include: [{ model: Category, as: 'category' }] }
      });
      posts = likes.map(like => like.post);
    } else if (currentPath === '/profile/saved') {
      const saves = await SavedPost.findAll({
        where: { user_id: userId },
        include: { model: Post, as: 'post', include: [{ model: Category, as: 'category' }] }
      });
      posts = saves.map(save => save.post);
    } else {
      posts = await Post.findAll({
        where: { user_id: userId },
        include: [{ model: Category, as: 'category' }],
        order: [['created_at', 'DESC']]
      });
    }

    res.render('profile', {
      user,
      username: user.username,
      email: user.email,
      user_role: user.Role?.role_name || 'user',
      posts: posts.map(p => p.toJSON()),
      categories,
      currentPath,
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
router.delete('/delete-post/:id', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const postId = req.params.id;

  try {
    // Find the post by ID and user ID
    const post = await Post.findOne({ where: { post_id: postId, user_id: userId } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Optional: delete image file if it exists and is not the default image
    if (post.thumbnail_url && post.thumbnail_url !== '/uploads/default-post.jpg') {
      const filePath = path.join(__dirname, '..', 'public', post.thumbnail_url); // Correct the path to the file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('Image deleted successfully');
        }
      });
    }

    // Delete the post from the database
    await post.destroy();
    res.status(200).json({ success: true });

  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✏️ Render edit form
router.get('/edit/:id', isAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const userId = req.session.userId;

  try {
    const post = await Post.findOne({
      where: { post_id: postId, user_id: userId },
      include: [{ model: Category, as: 'category' }]
    });

    if (!post) {
      req.flash('error', 'Post not found');
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

// 💾 Submit post edit
router.post('/edit-post', isAuthenticated, upload.single('thumbnail'), async (req, res) => {
  try {
    const { id, title, content, category_id } = req.body;

    const post = await Post.findOne({
      where: { post_id: id, user_id: req.session.userId }
    });

    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/profile');
    }

    post.title = title;
    post.content = content;
    post.category_id = category_id;

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
