const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
// const bookingController = require('../controllers/bookingController');

const CSP = 'Content-Security-Policy';
const POLICY =
  "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/ wss://127.0.0.1:* ;" +
  "base-uri 'self';block-all-mixed-content;" +
  "font-src 'self' https: data:;" +
  "frame-ancestors 'self';" +
  "img-src http://localhost:8000 'self' blob: data:;" +
  "script-src https: cdn.jsdelivr.net cdnjs.cloudflare.com api.mapbox.com 'self' blob:;" +
  "style-src 'self' https: 'unsafe-inline';" +
  'upgrade-insecure-requests;';

const router = express.Router();

router.use(viewsController.alerts);

router.use((req, res, next) => {
  res.setHeader(CSP, POLICY);
  next();
});

router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.use(authController.isLoggedIn);

router.get(
  '/',
  // bookingController.createBookingCheckout,
  viewsController.getOverview
);

router.get(
  '/confirm/:token',
  authController.emailConfirmation,
  viewsController.getConfirmedUser
);

router.get('/tours/:slug', viewsController.getTour);

router.get('/login', viewsController.getLogin);

router.get('/sign-up', viewsController.signUp);

module.exports = router;
