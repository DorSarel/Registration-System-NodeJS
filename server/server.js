const express = require('express');
const mongoose = require('./db/db');
const _ = require('lodash');
const app = express();


/*
app configuration
*/
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));


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

app.listen(3000, () => {
  console.log('Server is on...');
});
