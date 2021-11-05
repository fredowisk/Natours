//review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');
const catchAsync = require('../utils/catchAsync');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
      maxlength: [500, 'A review must have less or equal than 500 characters.']
    },
    rating: {
      type: Number,
      validate: {
        validator: function(v) {
          return /^[0-9]+$/.test(v);
        },
        message: '{VALUE} is not supported.'
      },
      required: [true, 'Please, give it a rating!']
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//creating a unique index for reviews, so the user can't post multiple reviews on the same tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//only getting these fields when search for the reviews
reviewSchema.pre(/^find/, function(next) {
  //old
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });
  this.select('-__v');

  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  //this points to the model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        numberRating: { $sum: 1 },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  let numberRating;
  let averageRating;

  if (!stats.length === 0) {
    numberRating = 0;
    averageRating = 0;
  } else {
    [{ numberRating, averageRating }] = stats;
  }

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: numberRating,
    ratingsAverage: averageRating
  });
};

reviewSchema.post('save', function() {
  //this points to current review

  this.constructor.calcAverageRatings(this.tour);
});

//creating a middleware for findOneAndDelete or Update using PRE
//because POST will run before the doc is already saved, so we can't get the query
reviewSchema.pre(/^findOneAnd/, async function(next) {
  //getting the tour and saving it on this, because we want to pass this
  //to another middleware
  this.result = await this.findOne();
  next();
});

//this middleware will run before the document is already saved,
//so we use POST, and the constructor to get access to function
reviewSchema.post(
  /^findOneAnd/,
  catchAsync(async function() {
    await this.result.constructor.calcAverageRatings(this.result.tour);
  })
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
