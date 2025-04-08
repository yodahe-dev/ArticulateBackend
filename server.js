const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');
const db = require('./models');
const methodOverride = require('method-override');
const ejsLayouts = require('express-ejs-layouts'); // Import express-ejs-layouts
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
const flash = require('connect-flash');

// Setup view engine and layouts
app.set('view engine', 'ejs');
app.set('views', './views');

// Use express-ejs-layouts
app.use(ejsLayouts); // This allows the layout system to work

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

// Set up flash middleware
app.use(flash());

// Middleware to make flash messages accessible to all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Middleware to pass role to the frontend
app.use((req, res, next) => {
  if (req.session.role) {
    res.locals.role = req.session.role; // Make role available in the views
  }
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'src')));





// Routes
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
