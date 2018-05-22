const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => {
        return validator.isEmail(value);
      },
      message: `{VALUE} is not a valid email`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

userSchema.methods.generateAuthToken = function() {
  let user = this;
  let access = 'auth';
  let token = jwt.sign({_id: user._id.toHexString(), access}, 'check').toString();

  user.tokens = user.tokens.concat([{access , token}]);
  return user.save().then(() => {
    return token;
  });
};

userSchema.statics.findByToken = function(token) {
  let User = this;
  let decoded;

  if (token) {
    try {
      decoded = jwt.verify(token, 'check');
    }
    catch (e) {
      return Promise.reject(e);
    }

    return User.findOne({
      _id: decoded._id,
      'tokens.access': 'auth',
      'tokens.token': token
    });
  }
  return Promise.reject('Token is undefined');
}

userSchema.statics.findByCredential = function(userObj) {
  let User = this;

  return User.findOne({
    email: userObj.email
  })
    .then((user) => {
      if (user.passwod !== userObj.password) {
        throw new Error('Password in DB not match to entered password');
      }

      return user;
    })
    .catch((e) => {
      res.status(400).send(e);
    });
}

const User = mongoose.model('User', userSchema);

module.exports = User;
