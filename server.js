require('dotenv').config(); // Ensure that .env variables are loaded

const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');
const db = require('./models');
const methodOverride = require('method-override');
const ejsLayouts = require('express-ejs-layouts'); // Import express-ejs-layouts
const { isAuthenticated, isNotAuthenticated, isAdminOrSubadmin } = require('./middleware/authMiddleware');
const adminRoute = require('./routes/adminRoute');
const signupRoute = require('./routes/signupRoute');
const loginRoute = require('./routes/loginRoute');
const homeRoute = require('./routes/homeRoute');
const profileRoute = require('./routes/profileRoute');
const createRoute = require('./routes/createRoute');
const likeRoute = require('./routes/likeRoute');
const savedPostRoute = require('./routes/savedPostRoute');
const categoryRoute = require('./routes/categoryRoute');
const commentRoute = require('./routes/commentRoute');
const flash = require('connect-flash');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(ejsLayouts);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use((req, res, next) => {
  if (req.session.role) {
    res.locals.role = req.session.role;
  }
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'src')));

app.get('/signup', isNotAuthenticated, (req, res) => {
  res.render('signup', { layout: false });
});
app.post('/signup', isNotAuthenticated, signupRoute);

app.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login', { layout: false });
});
app.post('/login', isNotAuthenticated, loginRoute);

app.use('/', isAuthenticated, homeRoute);
app.use('/profile', isAuthenticated, profileRoute);
app.use('/create', isAuthenticated, createRoute);
app.use('/likeRoute', likeRoute);
app.use('/savedPostRoute', savedPostRoute);
app.use('/category', isAuthenticated, isAdminOrSubadmin, categoryRoute);
app.use('/dashboard', isAuthenticated, isAdminOrSubadmin, adminRoute);
app.use('/', commentRoute);

app.get('/logout', isAuthenticated, (req, res) => {
  delete req.session.date;
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.redirect('/login');
  });
});

// 404 page handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Error handler (for general errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

db.sequelize.sync().then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT || 5000}`);
  });
});
