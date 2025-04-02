// authRoleMiddleware.js
const { User } = require('../models');

const isAdminOrSubadmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.session.userId);
    if (user && (user.role === 'admin' || user.role === 'subadmin')) {
      return next(); // Allow access
    }
    return res.status(403).json({ message: 'Forbidden: You are not authorized to perform this action' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { isAdminOrSubadmin };
