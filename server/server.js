const express = require('express');
const mongoose = require('./db/db');
const _ = require('lodash');
const app = express();


/*
app configuration
*/
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
/*
Login route
path: /
*/
app.get('/', (req, res) => {
  res.render('login.ejs');
});

app.listen(3000, () => {
  console.log('Server is on...');
});
