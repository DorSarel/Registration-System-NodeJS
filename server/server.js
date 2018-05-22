const express = require('express');
const mongoose = require('./db/db');
const _ = require('lodash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
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
app.use(cookieParser('secret'));
app.use(session({cookie: {maxAge: 60000 }}));
app.use(flash());

// Locals
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});



app.get('/', (req, res) => {
  let token = req.cookies['x-auth'];
  if (token) {
    User.findByToken(token)
      .then((user) => {
        if (!user) {
          return Promise.reject('No user fonud');
        }

          res.render('login.ejs', {user: user});
      })
      .catch((e) => {
        res.status(400).send(e);
      })
  }
  else {
      res.render('login.ejs', {user: null});
  }
});

app.post('/login', (req, res) => {
  let userObj = _.pick(req.body, ['email', 'password']);

  User.findByCredential(userObj)
    .then((user) => {
      return user.generateAuthToken();
    })
    .then((token) => {
      res.cookie('x-auth', token);
      req.flash('success', 'You logged in successfully');
      res.redirect('/hello');
    })
    .catch((e) => {
      res.status(400).send(e);
    })
});


app.get('/signup', (req, res) => {
  res.render('signup.ejs', {msg: req.flash('error')});
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
    req.flash('success', 'You successfully signed up');
    res.redirect('/hello');
  })
  .catch((e) => {
    let eMsg;
    if (e.errors.email) {
      eMsg = e.errors.email.message;
    }
    else if (e.errors.password) {
      eMsg = 'Password minimum length is 6 chars';
    }
    else if (e.code === 11000) {
      eMsg = 'This email is already registered';
    }

    req.flash('error', eMsg);
    res.redirect('/signup');
    // res.send(e);
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
      req.flash('success', 'You successfully logged out');
      res.redirect('/');
    })
    .catch((e) => {
      res.status(400).send(e);
    })
});

app.listen(3000, () => {
  console.log('Server is on...');
});
