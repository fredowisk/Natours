const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
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
    photo: {
      type: String,
      default: 'default.jpg'
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'Please provide a password!'],
      minlength: 8,
      //the password will never be showed in any input
      select: false
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
    passwordChangedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.virtual('bookings', {
  ref: 'Booking',
  foreignField: 'user',
  localField: '_id'
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

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  //this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

//using bcrypt to unhash the password and compare
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

//updating the last time password was changed
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //if the current token issue is less than the last time password was changed return true
    return JWTTimestamp < changedTimestamp;
  }

  //false means NOT changed!
  return false;
};

//creating the reset password token
userSchema.methods.createPasswordResetToken = function() {
  //creating a random token that will be used to reset password
  //this token will be sended to user e-mail
  const resetToken = crypto.randomBytes(32).toString('hex');

  //hashing the reset token, to save it in the database
  //so if we get hacked, the hacker will not be able to change the password
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //the reset token will expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
