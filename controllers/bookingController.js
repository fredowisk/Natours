const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });

  //Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.isSoldOut = catchAsync(async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.tourId);

    const dateIndex = tour.startDates.flatMap((value, index) => {
      if (value.date - new Date(req.body.date) === 0) return index;

      return [];
    });

    if (tour.startDates[dateIndex].soldOut) {
      return next(new AppError('This tour is sold out!.', 401));
    }

    if (dateIndex.length > 0) {
      tour.startDates[dateIndex].participants += 1;
      req.body.tour = req.params.tourId;
      req.body.price = tour.price;
      await tour.save();
      return next();
    }

    return next(new AppError('Please inform one of the available dates'));
  } catch (error) {
    return next(new AppError('Something went wrong! Try again.'));
  }
});

exports.cancelBooking = catchAsync(async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.tourId);
    const booking = await Booking.findById(req.params.id);

    const dateIndex = tour.startDates.flatMap((value, index) => {
      if (value.date - booking.date === 0) return index;

      return [];
    });

    tour.startDates[dateIndex].participants -= 1;

    if (tour.startDates[dateIndex].soldOut)
      tour.startDates[dateIndex].soldOut = false;

    await tour.save();
    return next();
  } catch (error) {
    return next(new AppError('Something went wrong! Try again.'));
  }
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //This is only TEMPORARY, because it's UNSECURE! Everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);

exports.getAllBookings = factory.getAll(Booking);

exports.getBooking = factory.getOne(Booking);

exports.updateBooking = factory.updateOne(Booking);

exports.deleteBooking = factory.deleteOne(Booking);
