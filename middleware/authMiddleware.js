const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

const isNotAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return next();
  }
  res.redirect('/');
};

const isAdminOrSubadmin = (req, res, next) => {
  const roleId = req.session.role;
  if (roleId === '9271e44a-0e00-11f0-894f-40b03495ba25' || roleId === '9276a62a-0e00-11f0-894f-40b03495ba25') {
    return next();
  } else {
    return res.redirect('/');
  }
};

module.exports = { isAuthenticated, isNotAuthenticated, isAdminOrSubadmin };
