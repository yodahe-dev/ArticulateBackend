const { User } = require('../models');

// Fast auth check middleware
const isAuthenticated = (req, res, next) => {
  req.session.userId ? next() : res.redirect('/login');
};

const isNotAuthenticated = (req, res, next) => {
  !req.session.userId ? next() : res.redirect('/');
};

// Super fast role check with minimal DB fetch
const isAdminOrSubadmin = async (req, res, next) => {
  const userId = req.session.userId;
  if (!userId) return res.redirect('/login');

  try {
    const user = await User.findOne({
      where: { id: userId },
      attributes: ['id'],
      include: {
        association: 'Role',
        attributes: ['role_name'],
      },
    });

    const role = user?.Role?.role_name;
    if (role === 'admin' || role === 'subadmin') return next();

    res.status(403).json({ message: 'Forbidden' });
  } catch (err) {
    console.error('Role Check Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { isAuthenticated, isNotAuthenticated, isAdminOrSubadmin };
