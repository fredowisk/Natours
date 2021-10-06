const express = require('express');

const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.getAllReviews
  )
  .post(reviewController.createReview);

router.route('/:id').get(authController.protect, reviewController.getReview);

module.exports = router;
