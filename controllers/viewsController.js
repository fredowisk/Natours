const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;

  if (alert === 'booking')
    res.locals.alert = `Your booking was successful! Please check your email for a confirmation.
      If your booking doesn't show up here immediatly, please come back later.`;

  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // Get tour data from collection
  const tours = await Tour.find();

  // Build template
  // Render that template using tour data from step 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //Get the data, for the requested tour (including reviews and guides)
  const tourSlug = req.params.slug;

  const tour = await Tour.findOne({ slug: tourSlug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name!', 404));
  }

  //Build template
  //Render template using data from step 1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLogin = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login'
  });
});

exports.signUp = catchAsync(async (req, res, next) => {
  res.status(200).render('sign-up', {
    title: 'Sign Up'
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getMyTours = catchAsync(async (req, res) => {
  // Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  //Find tours with the returned IDs
  const tourIDs = bookings.map(booking => booking.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

exports.getConfirmedUser = catchAsync(async (req, res) => {
  res.status(200).render('userConfirmed', {
    title: 'E-mail Confirmed!'
  });
});
