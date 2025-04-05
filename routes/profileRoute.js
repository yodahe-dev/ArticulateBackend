const express = require('express');
const router = express.Router();
const { Post, Category, User } = require('../models');  // Assuming User model is available
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', isAuthenticated, async (req, res) => {
    const userId = req.session.userId; // Access session with userId directly
    if (!userId) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // Fetch the posts for the current user
        const posts = await Post.findAll({
            where: { user_id: userId },
            include: [{
                model: Category,
                as: 'category',
                attributes: ['name']
            }],
            order: [['created_at', 'DESC']],
        });

        // Fetch the current user's details
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('profile', {
            username: user.username,
            email: user.email,
            user_role: user.role_id, // Assuming `role_id` is stored in the user object
            memberSince: user.created_at,
            posts: posts
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading profile');
    }
});

// Route to handle deleting a post
router.post('/delete-post/:id', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const postId = req.params.id;
  
    try {
      const post = await Post.findOne({ where: { id: postId, user_id: userId } });
  
      if (!post) {
        return res.status(404).send('Post not found');
      }
  
      // Delete the post
      await post.destroy();
  
      res.redirect('/profile');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting post');
    }
  });
  
// Route to handle deleting the user account
router.post('/delete-account', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
  
    try {
      const user = await User.findByPk(userId);
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      // Delete the user's posts first
      await Post.destroy({ where: { user_id: userId } });
  
      // Delete the user account
      await user.destroy();
  
      // Destroy the session after account deletion
      req.session.destroy((err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Failed to log out');
        }
        res.redirect('/login');  // Redirect to login after account deletion
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting account');
    }
  });
  

module.exports = router;
