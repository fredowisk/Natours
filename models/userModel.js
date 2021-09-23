const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    maxlength: [40, 'An username must have less or equal than 40 characters']
  },
  email: {
    type: String,
    required: [true, 'An user must have an email!'],
    unique: true,
    lowercase: true,
    validate: [validator.default.isEmail, 'Please provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8
  },
  passwordConfirmation: {
    type: String,
    required: [true, 'Please provide a password confirmation!'],
    validate: {
      //This only works on create and save!!!!!
      validator: function(item) {
        return item === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  }
});

userSchema.pre('save', async function(next) {
  //If the password is already modified just call the next middleware
  if (!this.isModified('password')) return next();

  //hashing the password, to be harder to discover the real one
  this.password = await bcrypt.hash(this.password, 12);

  //deleting password confirmation because it is only useful in user creation
  this.passwordConfirmation = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
