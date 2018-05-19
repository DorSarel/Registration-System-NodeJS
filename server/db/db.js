const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/loginSystem');
mongoose.Promise = global.Promise;

module.exports = mongoose;
