const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');
const db = require('./models');

const signupRoute = require('./routes/signupRoute');
const loginRoute = require('./routes/loginRoute');
const homeRoute = require('./routes/homeRoute');
const profileRoute = require('./routes/profileRoute');
const createRoute = require('./routes/createRoute');
const likeRoute = require('./routes/likeRoute');
const savedPostRoute = require('./routes/savedPostRoute');

const { isAuthenticated, isNotAuthenticated } = require('./middleware/authMiddleware');
const authRoute = require('./middleware/authRoute');
const { checkAdmin, checkSubAdmin, getUserRole } = require('./middleware/authroleMiddleware');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(authRoute);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.get('/', isAuthenticated, (req, res) => {
  res.redirect('/home');
});

app.use('/like', likeRoute);
app.use('/save', savedPostRoute);

app.use((req, res) => {
  res.status(404).send('Page not found');
});

db.sequelize.sync().then(() => {
  app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
  });
});
