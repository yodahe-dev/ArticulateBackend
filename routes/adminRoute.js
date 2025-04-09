const express = require('express');
const { User, Role, Post, SavedPost, Comment, PostLike } = require('../models');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      include: ['Role']
    });
    const roles = await Role.findAll();
    const posts = await Post.findAll({
      include: [
        {
          model: User, // Assuming Post has a relation to User
          attributes: ['username'], // Include only the username from the User model
        }
      ]
    });
    
    const savedPostCount = await SavedPost.count();
    const commentCount = await Comment.count();
    const postLikeCount = await PostLike.count();

    res.render('adminDashboard', {
      users,
      roles,
      posts,
      savedPostCount,
      commentCount,
      postLikeCount,
      title: 'Admin Dashboard'
    });
  } catch (err) {
    console.error('Error fetching users, roles, or posts:', err);
    req.flash('error', 'Failed to load admin dashboard');
    res.redirect('/');
  }
});

router.post('/change-role', async (req, res) => {
  const { userId, newRoleId } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/dashboard');
    }

    const role = await Role.findByPk(newRoleId);
    if (!role) {
      req.flash('error', 'Role not found');
      return res.redirect('/dashboard');
    }

    user.role_id = newRoleId;
    await user.save();

    req.flash('success', 'User role updated successfully');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error updating role:', err);
    req.flash('error', 'Failed to update user role');
    res.redirect('/dashboard');
  }
});


module.exports = router;
