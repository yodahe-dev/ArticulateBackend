const express = require('express');
const router = express.Router();
const { User, Post, Category, Role } = require('../models');
const flash = require('connect-flash');

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  req.flash('error', 'Please login first');
  res.redirect('/login');
};

// Middleware to check if the user is an admin or subadmin
const isAdminOrSubadmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.session.userId, { include: 'Role' });
    if (user && (user.Role.role_name === 'admin' || user.Role.role_name === 'subadmin')) {
      return next();
    }
    req.flash('error', 'You are not authorized to perform this action');
    return res.status(403).redirect('/');
  } catch (error) {
    console.error('Error checking role:', error);
    req.flash('error', 'Error checking role');
    res.redirect('/');
  }
};

// Admin Dashboard Route
router.get('/dashboard', isAuthenticated, isAdminOrSubadmin, async (req, res) => {
  try {
    const admin = await User.findByPk(req.session.userId, { include: ['Role'] });

    if (!admin) {
      req.flash('error', 'Admin not found');
      return res.redirect('/');
    }

    const posts = await Post.findAll({
      include: [{ model: Category, as: 'category' }],
      order: [['created_at', 'DESC']],
    });

    const users = await User.findAll();

    res.render('admin/dashboard', {
      admin,
      posts,
      users,
      title: 'Admin Dashboard',
      success: req.flash('success'),
      error: req.flash('error'),
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    req.flash('error', 'Error loading admin dashboard');
    res.redirect('/');
  }
});

// Other routes...

module.exports = router;
