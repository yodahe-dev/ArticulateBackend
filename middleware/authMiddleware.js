const { User } = require('../models');

const isAuthenticated = (req, res, next) => {
  req.session.userId ? next() : res.redirect('/login');
};

const isNotAuthenticated = (req, res, next) => {
  !req.session.userId ? next() : res.redirect('/');
};

const isAdminOrSubadmin = async (req, res, next) => {
  const userId = req.session.userId;
  if (!userId) return res.redirect('/login');

  try {
    const user = await User.findOne({
      where: { user_id: userId },
      attributes: ['user_id'],
      include: {
        association: 'Role',
        attributes: ['role_name'],
      },
    });

    const role = user?.Role?.role_name;
    if (role === 'admin' || role === 'subadmin') return next();

    res.status(403).json({ message: 'Forbidden' });
  } catch (err) {
    console.error('Role Check Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { isAuthenticated, isNotAuthenticated, isAdminOrSubadmin };
