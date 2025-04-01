const express = require('express');
const app = express();
const session = require('express-session');
const db = require('./models');
const signupRoute = require('./routes/signupRoute');
const loginRoute = require('./routes/loginRoute');
const homeRoute = require('./routes/homeRoute');
const { isAuthenticated, isNotAuthenticated } = require('./middleware/authMiddleware');

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

app.get('/signup', isNotAuthenticated, (req, res) => {
  res.render('signup');
});

app.post('/signup', isNotAuthenticated, signupRoute);

app.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login');
});

app.post('/login', isNotAuthenticated, loginRoute);

app.use('/home', isAuthenticated, homeRoute);

app.get('/', isAuthenticated, (req, res) => {
  res.redirect('/home');
});

db.sequelize.sync().then(() => {
  app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
  });
});
