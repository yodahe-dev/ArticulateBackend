const express = require('express');
const router = express.Router();
const { isAuthenticated, isNotAuthenticated, isAdminOrSubadmin } = require('../middleware/authMiddleware');

// Route that requires authentication
router.get('/profile', isAuthenticated, (req, res) => {
  // Your code to render the profile page
  res.render('profile');
});

// Route that is only accessible for admins or subadmins
router.get('/admin-dashboard', isAuthenticated, isAdminOrSubadmin, (req, res) => {
  // Your code for admin or subadmin dashboard
  res.render('admin-dashboard');
});

module.exports = router;
