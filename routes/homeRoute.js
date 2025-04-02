const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Post, Category } = require('../models');

router.get('/', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/signup'); // Redirect if not authenticated
  }

  try {
    const user = await User.findByPk(req.session.userId);

    // Fetch all posts except the logged-in user's own posts
    const posts = await Post.findAll({
      where: {
        user_id: { [Op.ne]: req.session.userId }, // Exclude user's own posts
      },
      include: [{
        model: Category,
        as: 'category',  // Specify the alias if one is used in associations
        attributes: ['name']
      }],
      order: [['created_at', 'DESC']], // Use created_at (not createdAt)
    });

    const categories = await Category.findAll();

    res.render('welcome', { username: user.username, posts, categories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading posts');
  }
});

module.exports = router;
