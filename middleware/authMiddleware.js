const { User } = require('../models');

// Check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

// Check if the user is not authenticated
const isNotAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return next();
  }
  res.redirect('/');
};

// Check if the user has admin or subadmin role
const isAdminOrSubadmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.session.userId, { include: 'Role' });

    // Ensure user exists and their role is either 'admin' or 'subadmin'
    if (user && (user.Role.role_name === 'admin' || user.Role.role_name === 'subadmin')) {
      return next(); // Allow access if the user has the required role
    }

    // If the user does not have the correct role
    return res.status(403).json({ message: 'Forbidden: You are not authorized to perform this action' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { isAuthenticated, isNotAuthenticated, isAdminOrSubadmin };
