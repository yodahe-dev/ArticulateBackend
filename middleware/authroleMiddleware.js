const express = require('express');
const { User } = require('../models');
const router = express.Router();

// Role Mapping (Stored in memory for now)
const roleMapping = {
  '9271e44a-0e00-11f0-894f-40b03495ba25': 'admin',
  '9276a62a-0e00-11f0-894f-40b03495ba25': 'subadmin',
  '9276a7a0-0e00-11f0-894f-40b03495ba25': 'user',
};

// Middleware to check if the user is admin
const checkAdmin = (req, res, next) => {
  const userId = req.session.userId;
  const role = roleMapping[userId];

  if (role === 'admin') {
    return next(); // Continue if admin
  }
  return res.status(403).send('Access Denied: Admins Only');
};

// Middleware to check if the user is a subadmin
const checkSubAdmin = (req, res, next) => {
  const userId = req.session.userId;
  const role = roleMapping[userId];

  if (role === 'admin' || role === 'subadmin') {
    return next(); // Continue if admin or subadmin
  }
  return res.status(403).send('Access Denied: Subadmin Only');
};

// Middleware to check if the user is authenticated and get their role
const getUserRole = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login'); // Redirect to login if not authenticated
  }
  
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    const role = roleMapping[user.user_id] || 'user'; // Default to 'user' if not found
    req.userRole = role;  // Attach role to request object
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error retrieving user data');
  }
};

module.exports = { checkAdmin, checkSubAdmin, getUserRole };
