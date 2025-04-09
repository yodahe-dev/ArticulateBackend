const express = require('express');
const bcrypt = require('bcryptjs');
const { User, Role } = require('../models');
const router = express.Router();

router.get('/login', (req, res) => {
  const flash = req.session.flashMessage || {};  // Default to empty object if no flash message
  delete req.session.flashMessage;
  res.render('login', { 
    layout: false,  // Disable layout for this page
    flash 
  });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password_hash } = req.body;

    if (!email || !password_hash) {
      req.session.flashMessage = {
        type: 'warning',
        message: 'All fields are required.',
      };
      return res.redirect('/login');
    }

    const user = await User.findOne({
      where: { email },
      include: { model: Role },
    });

    if (!user) {
      req.session.flashMessage = {
        type: 'error',
        message: 'Invalid email or password',
      };
      return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password_hash, user.password_hash);
    if (!isMatch) {
      req.session.flashMessage = {
        type: 'error',
        message: 'Invalid email or password',
      };
      return res.redirect('/login');
    }

    // Save session data
    req.session.userId = user.user_id;
    req.session.role = user.Role?.role_name || 'user';

    req.session.flashMessage = {
      type: 'success',
      message: 'Login successful!',
    };

    // Redirect by role
    const role = user.Role?.role_name;
    if (role === 'admin' || role === 'subadmin') {
      return res.redirect('/profile');
    }

    res.redirect('/');
  } catch (err) {
    console.error('Login Error:', err.message);
    req.session.flashMessage = {
      type: 'error',
      message: 'Server error. Please try again.',
    };
    res.redirect('/login');
  }
});

module.exports = router;
