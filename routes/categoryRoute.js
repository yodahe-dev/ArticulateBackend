const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const { isAuthenticated } = require('../middleware/authMiddleware');
const methodOverride = require('method-override');

// Use method-override middleware to simulate PUT and DELETE requests
router.use(methodOverride('_method'));

// Helper function to check if user is Admin or Subadmin
const isAdminOrSubadmin = (req, res, next) => {
  const roleId = req.session.role;
  
  if (roleId === '9271e44a-0e00-11f0-894f-40b03495ba25' || roleId === '9276a62a-0e00-11f0-894f-40b03495ba25') {
    return next(); // Allow access to the route if admin or subadmin
  } else {
    // Respond with a forbidden status code (403) without rendering or redirecting
    return res.status(403).json({ message: 'Access denied. Only admins or subadmins can perform this action.' });
  }
};

// Category Routes

// Display categories - Accessible to authenticated users only
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.render('category', { categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error loading categories' });
  }
});

// Create a new category - Only accessible to admin or subadmin
router.post('/create', isAuthenticated, isAdminOrSubadmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const newCategory = await Category.create({ name, user_id: req.session.userId });
    res.redirect('/category');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating category' });
  }
});

// Update category - Only accessible to admin or subadmin
router.put('/update/:categoryId', isAuthenticated, isAdminOrSubadmin, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name;
    await category.save();

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating category' });
  }
});

// Delete category - Only accessible to admin or subadmin
router.delete('/delete/:categoryId', isAuthenticated, isAdminOrSubadmin, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting category' });
  }
});

module.exports = router;
