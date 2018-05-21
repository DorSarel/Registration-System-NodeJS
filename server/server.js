const express = require('express');
const mongoose = require('./db/db');
const _ = require('lodash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

const User = require('./models/user');
const {authenticate} = require('./middleware/middleware');

/*
app configuration
*/
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/*
Login route
path: /
*/
app.get('/', (req, res) => {
  res.render('login.ejs');
});

/*
Signup route
path: /signup
*/
app.get('/signup', (req, res) => {
  res.render('signup.ejs');
});

app.post('/signup', (req, res) => {
  // Getting user information from POST req
  let userObj = _.pick(req.body, ['email', 'password']);

  // Creating new user and assign token
  let newUser = new User(userObj);
  newUser.save()
  .then(() => {
    return newUser.generateAuthToken();
  })
  .then((token) => {
    res.cookie('x-auth', token);
    res.redirect('/hello');
  })
  .catch((e) => {
    res.status(400).send(e);
  });
});

app.get('/hello',authenticate, (req, res) => {
  res.render('hello.ejs', {user: req.user});
});

app.listen(3000, () => {
  console.log('Server is on...');
});
