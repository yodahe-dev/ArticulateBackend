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
  const lengthCheck = /^.{8,}$/; // Minimum 8 characters
  const upperCheck = /[A-Z]/; // At least one uppercase letter
  const lowerCheck = /[a-z]/; // At least one lowercase letter
  const digitCheck = /\d/; // At least one digit
  const specialCheck = /[!@#$%^&*(),.?":{}|<>]/; // At least one special character
  
  return lengthCheck.test(password) && upperCheck.test(password) && lowerCheck.test(password) &&
         digitCheck.test(password) && specialCheck.test(password);
}

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password_hash } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).send('Invalid email format');
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send('Email already in use');
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).send('Username already taken');
    }

    if (!isValidPassword(password_hash)) {
      return res.status(400).send('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a digit, and a special character');
    }

    if (hasRepetitiveChars(password_hash)) {
      return res.status(400).send('Password cannot contain repetitive characters');
    }

    const hashedPassword = await bcrypt.hash(password_hash, 10);
    const defaultRoleId = '9276a7a0-0e00-11f0-894f-40b03495ba25';

    const newUser = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      role_id: defaultRoleId,
    });

    req.session.userId = newUser.user_id;
    res.redirect('/');

  } catch (error) {
    console.error(error);
    res.status(500).send('Error during signup');
  }
});

module.exports = router;
