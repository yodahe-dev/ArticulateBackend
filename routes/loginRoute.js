const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User, Role } = require('../models');

router.get('/login', (req, res) => {
  res.render('login'); // Render login form
});

router.post('/login', async (req, res) => {
  try {
    const { email, password_hash } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).send('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password_hash, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).send('Invalid email or password');
    }

    req.session.userId = user.user_id;
    req.session.role = user.role_id;  // Store role in session

    res.redirect('/'); // Redirect to homepage
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during login');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error during logout');
    }
    res.redirect('/login');
  });
});

module.exports = router;
