const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');


router.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login');
  });
});

module.exports = router;
