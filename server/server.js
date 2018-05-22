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


app.get('/', (req, res) => {
  res.render('login.ejs');
});

app.post('/', (req, res) => {
  let userObj = _.pick(req.body, ['email', 'password']);

  User.findByCredential(userObj)
    .then((user) => {
      return user.generateAuthToken();
    })
    .then((token) => {
      res.cookie('x-auth', token);
      res.redirect('/hello');
    })
    .catch((e) => {
      res.status(400).send(e);
    })
});


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

app.post('/logout', authenticate, (req, res) => {
  // Clear the token cookie
  res.clearCookie('x-auth');

  // Remove user token from the tokens array
  let user = req.user;
  user.tokens = user.tokens.filter((tokenObj) => {
    return tokenObj.token !== req.token;
  });

  user.save()
    .then(() => {
      res.redirect('/');
    })
    .catch((e) => {
      res.status(400).send(e);
    })
});

app.listen(3000, () => {
  console.log('Server is on...');
});
