const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);

exports.setTourUserIds = (req, res, next) => {
  //if the tour was not specified, get the tour ID on the params
  if (!req.body.tour) req.body.tour = req.params.tourId;
  //if the user was not specified, get the id by the protect middleware
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// exports.createReview = factory.createOne(Review);

exports.createReview = factory.createOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);
