const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const CSP = 'Content-Security-Policy';
const POLICY =
  "default-src 'self' https://*.mapbox.com wss://127.0.0.1:* ;" +
  "base-uri 'self';block-all-mixed-content;" +
  "font-src 'self' https: data:;" +
  "frame-ancestors 'self';" +
  "img-src http://localhost:8000 'self' blob: data:;" +
  "script-src https: cdn.jsdelivr.net cdnjs.cloudflare.com api.mapbox.com 'self' blob:;" +
  "style-src 'self' https: 'unsafe-inline';" +
  'upgrade-insecure-requests;';

const router = express.Router();

router.use((req, res, next) => {
  res.setHeader(CSP, POLICY);
  next();
});

router.get('/me', authController.protect, viewsController.getAccount);

router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);

router.get('/tours/:slug', viewsController.getTour);

router.get('/login', viewsController.getLogin);

module.exports = router;
