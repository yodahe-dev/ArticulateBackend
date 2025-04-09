const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const { isAuthenticated } = require('../middleware/authMiddleware');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

// Middleware to check if user is admin or subadmin by role name
const isAdminOrSubadmin = (req, res, next) => {
  const roleName = req.session.role;

  if (roleName === 'admin' || roleName === 'subadmin') {
    return next();
  } else {
    req.flash('error', 'Access denied. Only admins or subadmins can perform this action.');
    return res.redirect('/category');
  }
};

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.render('category', { categories, title: 'Manage Categories', messages: req.flash('error') });
  } catch (error) {
    req.flash('error', 'Error loading categories');
    res.redirect('/category');
  }
});

router.post('/create', isAuthenticated, isAdminOrSubadmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      req.flash('error', 'Category name is required');
      return res.redirect('/category');
    }

    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      req.flash('error', 'Category already exists');
      return res.redirect('/category');
    }

    await Category.create({ name, user_id: req.session.userId });
    res.redirect('/category');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Server error while creating category');
    res.redirect('/category');
  }
});

router.put('/update/:categoryId', isAuthenticated, isAdminOrSubadmin, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!name) {
      req.flash('error', 'Category name is required');
      return res.redirect(`/category`);
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect(`/category`);
    }

    category.name = name;
    await category.save();

    req.flash('success', 'Category updated successfully');
    res.redirect('/category');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Server error while updating category');
    res.redirect('/category');
  }
});

router.delete('/delete/:categoryId', isAuthenticated, isAdminOrSubadmin, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findByPk(categoryId);
    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/category');
    }

    await category.destroy();
    req.flash('success', 'Category deleted successfully');
    res.redirect('/category');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Server error while deleting category');
    res.redirect('/category');
  }
});

module.exports = router;
