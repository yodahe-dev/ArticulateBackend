const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');
const db = require('./models');
const methodOverride = require('method-override');
const { isAuthenticated, isNotAuthenticated, isAdminOrSubadmin } = require('./middleware/authMiddleware');

// Import routes
const signupRoute = require('./routes/signupRoute');
const loginRoute = require('./routes/loginRoute');
const homeRoute = require('./routes/homeRoute');
const profileRoute = require('./routes/profileRoute');
const createRoute = require('./routes/createRoute');
const likeRoute = require('./routes/likeRoute');
const savedPostRoute = require('./routes/savedPostRoute');
const categoryRoute = require('./routes/categoryRoute');
const commentRoute = require('./routes/commentRoute');

// Setup view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware to parse requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session middleware
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware to pass role to the frontend
app.use((req, res, next) => {
  if (req.session.role) {
    res.locals.role = req.session.role; // Make role available in the views
  }
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/signup', isNotAuthenticated, (req, res) => {
  res.render('signup');
});
app.post('/signup', isNotAuthenticated, signupRoute);

app.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login');
});
app.post('/login', isNotAuthenticated, loginRoute);

app.use('/', isAuthenticated, homeRoute);
app.use('/profile', isAuthenticated, profileRoute);
app.use('/create', isAuthenticated, createRoute);

app.use('/likeRoute', likeRoute);
app.use('/savedPostRoute', savedPostRoute);

app.use('/category', isAuthenticated, isAdminOrSubadmin, categoryRoute);
app.use('/', commentRoute);

// Logout route
app.get('/logout', isAuthenticated, (req, res) => {
  delete req.session.date;

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.redirect('/login');
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start the server
db.sequelize.sync().then(() => {
  app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
  });
});
