const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');
const db = require('./models');

// Import Routes
const signupRoute = require('./routes/signupRoute');
const loginRoute = require('./routes/loginRoute');
const homeRoute = require('./routes/homeRoute');
const profileRoute = require('./routes/profileRoute');
const createRoute = require('./routes/createRoute'); // Import createRoute

// Import Middleware
const { isAuthenticated, isNotAuthenticated } = require('./middleware/authMiddleware');

// Set EJS as the View Engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure Sessions
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Serve Static Files (For Uploaded Images)
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

app.use('/home', isAuthenticated, homeRoute);
app.use('/profile', isAuthenticated, profileRoute);
app.use('/create', isAuthenticated, createRoute); // Add Create Post Route

// Redirect root to /home
app.get('/', isAuthenticated, (req, res) => {
  res.redirect('/home');
});

// Sync Database and Start Server
db.sequelize.sync().then(() => {
  app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
  });
});
