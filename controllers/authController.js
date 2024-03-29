const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  //creating a cookie
  res.cookie('jwt', token, {
    expires: new Date(
      //days * hours * seconds * miliseconds
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  //removing the password for security purposes
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  //Generate the random email token
  const emailToken = newUser.createEmailConfirmationToken();

  const url = `${req.protocol}://${req.get('host')}/confirm/${emailToken}`;

  try {
    await new Email(newUser, url).sendWelcome();
    //deactivating all validations that are in our schema
    await newUser.save({ validateBeforeSave: false });

    // //Deleting the password property for security purposes
    Reflect.deleteProperty(newUser._doc, 'password');

    createSendToken(newUser, 201, req, res);
  } catch (error) {
    newUser.emailConfirmationToken = undefined;
    await newUser.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  //Check if user exists && password is corret
  //using .select because the password was removed form selects in the model
  const user = await User.findOne({ email }).select('+password');

  //comparing the parameter password and the database password
  //in the if statement, because if the user doesn't exist the verification will not execute
  //using a default error for security purposes
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  //If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.clearCookie('jwt');

  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  //Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.'),
      401
    );
  }

  //Verify if token is valid
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  //Check if user still exists
  const freshUser = await User.findById(decodedToken.id);
  if (!freshUser)
    return next(
      new AppError(
        'The user belonging to this session does no longer exists.',
        401
      )
    );

  // iat (issued at) = Timestamp de quando o token foi criado;
  //Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decodedToken.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  //Grant access to protected route!
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

//Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //Verify token
      const decodedToken = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //Check if user still exists
      const freshUser = await User.findById(decodedToken.id);
      if (!freshUser) return next();

      // iat (issued at) = Timestamp de quando o token foi criado;
      //Check if user changed password after the token was issued
      if (freshUser.changedPasswordAfter(decodedToken.iat)) {
        return next();
      }

      //There is a logged in user
      res.locals.user = freshUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

exports.isBookingPaid = async (req, res, next) => {
  const booking = await Booking.findOne({
    tour: req.params.tourId,
    user: req.user.id,
  });

  if (!booking)
    return next(
      new AppError('You just can review/rate a paid booked tour.', 401)
    );

  next();
};

//wrapping the middleware to get access to the roles
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //roles ['admin', 'lead-guide']. role='user'
    //if the user role is not in the permitted roles stop the route!
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 403)
      );
    }

    //and if is included, just pass for the next middleware
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with that email address.', 404));

  //Generate the random reset token
  const resetToken = user.createPasswordResetToken();

  //deactivating all validations that are in our schema
  await user.save({ validateBeforeSave: false });

  //Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based on the token
  //encrypting the user token, to search on the database
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //searching for the user with the encrypted token, and verifying if the token has not expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //If token has not expired, and there is a user, set the new password
  if (!user)
    return next(new AppError('This token is invalid or has expired!', 400));

  user.password = req.body.password;
  user.passwordConfirmation = req.body.passwordConfirmation;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //Update changedPasswordAt property for the user

  //Log the user in, and send JWT
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword, newPasswordConfirmation } = req.body;
  //Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new AppError('This user no longer exists', 404));
  }

  //Check if posted current password is correct
  if (!(await user.correctPassword(oldPassword, user.password)))
    return next(new AppError('Current password is incorrect!', 401));

  if (await user.correctPassword(newPassword, user.password))
    return next(
      new AppError('New password cannot be equal to current password!')
    );

  //If so update password
  user.password = newPassword;
  user.passwordConfirmation = newPasswordConfirmation;

  await user.save();
  //User.findByIdAndUpdate will NOT work as intended!
  //The password will not be encrypted!

  //Log user in and send JWT
  createSendToken(user, 200, req, res);
});

exports.emailConfirmation = catchAsync(async (req, res, next) => {
  //get user based on the token
  //encrypting the user token, to search on the database
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //searching for the user with the encrypted token, and verifying if the token has not expired
  const user = await User.findOne({
    emailConfirmationToken: hashedToken,
  });

  if (!user)
    return next(new AppError('This token is invalid or has expired!', 400));

  //If token exists, and there is a user, confirm the e-mail

  user.emailConfirmed = true;
  user.emailConfirmationToken = null;

  await User.updateOne({ _id: user._id }, user);

  next();
});
