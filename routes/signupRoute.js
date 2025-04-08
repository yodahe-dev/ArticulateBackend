const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const validator = require('validator');

function hasRepetitiveChars(password) {
  const regex = /^(.)\1+$/;
  return regex.test(password);
}

function isValidPassword(password) {
  const lengthCheck = /^.{8,}$/;
  const upperCheck = /[A-Z]/;
  const lowerCheck = /[a-z]/;
  const digitCheck = /\d/;
  const specialCheck = /[!@#$%^&*(),.?":{}|<>]/;
  
  return lengthCheck.test(password) && upperCheck.test(password) && lowerCheck.test(password) &&
         digitCheck.test(password) && specialCheck.test(password);
}

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password_hash } = req.body;

    // Validate email format
    if (!validator.isEmail(email)) {
      req.session.flashMessage = { type: 'error', message: 'Invalid email format' };
      return res.redirect('/signup');
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      req.session.flashMessage = { type: 'error', message: 'Email already in use' };
      return res.redirect('/signup');
    }

    // Check if username is already taken
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      req.session.flashMessage = { type: 'error', message: 'Username already taken' };
      return res.redirect('/signup');
    }

    // Validate password strength
    if (!isValidPassword(password_hash)) {
      req.session.flashMessage = { type: 'error', message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a digit, and a special character' };
      return res.redirect('/signup');
    }

    // Prevent repetitive characters in the password
    if (hasRepetitiveChars(password_hash)) {
      req.session.flashMessage = { type: 'error', message: 'Password cannot contain repetitive characters' };
      return res.redirect('/signup');
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password_hash, 10);
    const defaultRoleId = '9276a7a0-0e00-11f0-894f-40b03495ba25'; // Default user role ID

    const newUser = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      role_id: defaultRoleId,
    });

    req.session.userId = newUser.user_id;
    req.session.role = 'user';

    req.session.flashMessage = { type: 'success', message: 'Account created successfully! Please login.' };
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.session.flashMessage = { type: 'error', message: 'An error occurred during signup. Please try again.' };
    res.redirect('/signup');
  }
});

module.exports = router;
