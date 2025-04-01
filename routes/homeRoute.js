const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Homepage route
router.get('/', async (req, res) => {
  if (req.session.userId) {
    // Fetch the user details if authenticated
    const user = await User.findByPk(req.session.userId);
    res.render('welcome', { username: user.username }); // Render the welcome page
  } else {
    res.redirect('/signup'); // Redirect to signup page if not authenticated
  }
});

module.exports = router;
