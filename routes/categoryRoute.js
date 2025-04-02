const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const { isAuthenticated } = require('../middleware/authMiddleware');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

const isAdminOrSubadmin = (req, res, next) => {
    const roleId = req.session.role;
    
    if (roleId === '9271e44a-0e00-11f0-894f-40b03495ba25' || roleId === '9276a62a-0e00-11f0-894f-40b03495ba25') {
        return next();
    } else {
        return res.status(403).json({ message: 'Access denied. You must be an admin or subadmin.' });
    }
};

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.render('category', { categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error loading categories' });
    }
});

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

router.put('/update/:categoryId', isAuthenticated, isAdminOrSubadmin, async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { name } = req.body;
  
      console.log("Updating category:", categoryId, "New name:", name); // Debugging log
  
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
