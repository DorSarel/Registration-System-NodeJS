const express = require('express');
const mongoose = require('./db/db');
const _ = require('lodash');
const bodyParser = require('body-parser');
const app = express();

const User = require('./models/user');


/*
app configuration
*/
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

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
  let userObj = _.pick(req.body, ['email', 'userPass']);

  let newUser = new User(userObj);
  newUser.save()
  .then(() => {
    return newUser.generateAuthToken();
  })
  .then((token) => {
    // Redirect to relevant page after signin
  })
  .catch((e) => {
    throw e;
  });
});

app.listen(3000, () => {
  console.log('Server is on...');
});
