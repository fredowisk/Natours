const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    metadata: {
      index: res.locals.index,
    },
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`,
            ],
          },
        },
      },
    ],
  });

  //Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.isSoldOut = catchAsync(async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.tourId);

    const dateIndex = tour.startDates.findIndex((value) => !value.soldOut);

    if (dateIndex < 0) {
      return next(new AppError('This tour is sold out!.', 401));
    }

    res.locals.index = dateIndex;
    req.body.tour = req.params.tourId;
    req.body.price = tour.price;

    return next();
  } catch (error) {
    return next(new AppError('Please inform one of the available dates'));
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

    const tourStats = tour.startDates[dateIndex];

    tourStats.participants -= 1;

    if (tourStats.soldOut) tourStats.soldOut = false;

    await tour.save();
    return next();
  } catch (error) {
    return next(new AppError('Please inform one of the available dates'));
  }
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   //This is only TEMPORARY, because it's UNSECURE! Everyone can make bookings without paying
//   const { tour, user, price } = req.query;

//   if (!tour && !user && !price) return next();

//   await Booking.create({ tour, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  const { index } = session.metadata;

  const newTour = await Tour.findById(tour);

  const tourStats = newTour.startDates[index];

  await Booking.create({
    tour,
    user,
    price,
    date: tourStats.date,
  });

  tourStats.participants += 1;

  if (tourStats.participants === newTour.maxGroupSize) tourStats.soldOut = true;

  await newTour.save();
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook error: ${error.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    createBookingCheckout(event.data.object);
  }

  res.status(200).json({
    received: true,
  });
};

exports.createBooking = factory.createOne(Booking);

exports.getAllBookings = factory.getAll(Booking);

exports.getBooking = factory.getOne(Booking);

exports.updateBooking = factory.updateOne(Booking);

exports.deleteBooking = factory.deleteOne(Booking);
