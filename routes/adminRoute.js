const express = require('express');
const { User, Role, Post, SavedPost, Comment, PostLike } = require('../models'); // Include SavedPost, Comment, PostLike
const router = express.Router();

// Admin dashboard page
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      include: ['Role']  // Fetch users with their associated roles
    });
    const roles = await Role.findAll();  // Fetch all roles
    const posts = await Post.findAll();  // Fetch all posts (can be modified for pagination or filters)
    
    // Count records in the SavedPost, Comment, and PostLike tables
    const savedPostCount = await SavedPost.count();  // Count the number of saved posts
    const commentCount = await Comment.count();  // Count the number of comments
    const postLikeCount = await PostLike.count();  // Count the number of post likes

    res.render('adminDashboard', {
      users,
      roles,
      posts,  // Pass the posts data to the view
      savedPostCount,  // Pass the savedPostCount to the view
      commentCount,    // Pass the commentCount to the view
      postLikeCount,   // Pass the postLikeCount to the view
      title: 'Admin Dashboard'
    });
  } catch (err) {
    console.error('Error fetching users, roles, or posts:', err);
    req.flash('error', 'Failed to load admin dashboard');
    res.redirect('/');  // Redirect to home on failure
  }
});

// Route to change user role
router.post('/change-role', async (req, res) => {
  const { userId, newRoleId } = req.body;

  try {
    // Find the user by primary key (ID)
    const user = await User.findByPk(userId);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/dashboard');  // Redirect if user is not found
    }

    // Find the role by its ID
    const role = await Role.findByPk(newRoleId);
    if (!role) {
      req.flash('error', 'Role not found');
      return res.redirect('/dashboard');  // Redirect if role is not found
    }

    // Update the user's role
    user.role_id = newRoleId;
    await user.save();  // Save the updated role to the user

    req.flash('success', 'User role updated successfully');
    res.redirect('/dashboard');  // Redirect to the dashboard after success
  } catch (err) {
    console.error('Error updating role:', err);
    req.flash('error', 'Failed to update user role');
    res.redirect('/dashboard');  // Redirect on error
  }
});

// Optional: Route for deleting posts (if required)
router.post('/posts/:postId/delete', async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/dashboard');
    }

    // Delete the post
    await post.destroy();
    req.flash('success', 'Post deleted successfully');
    res.redirect('/dashboard');  // Redirect after deleting the post
  } catch (err) {
    console.error('Error deleting post:', err);
    req.flash('error', 'Failed to delete post');
    res.redirect('/dashboard');  // Redirect if there was an error
  }
});

module.exports = router;
