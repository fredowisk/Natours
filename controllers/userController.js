const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(prop => {
    if (allowedFields.includes(prop)) newObj[prop] = obj[prop];
  });

  return newObj;
};

exports.getAllUsers = factory.getAll(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  //Create an error if user POSTS password data
  if (req.body.password || req.body.passwordConfirmation)
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword',
        400
      )
    );

  //Filtering unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  //Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  if (!updatedUser) {
    next(new AppError('This user no longer exists', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUser = factory.getOne(User);

//DO NOT UPDATE PASSWORD WITH THIS!
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
