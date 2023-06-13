const AppError = require('../utils/appError');

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  const message = `Duplicate field value: ${Object.values(
    error.keyValue
  )}. Please use another value!`;

  // const errorName = { ...error.keyValue };
  // console.log(errorName);

  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((value) => value.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your session has expired! Please log in again', 401);

const errorHandlers = {
  sendErrorDevelopment: (error, req, res) => {
    //API
    if (req.originalUrl.startsWith('/api')) {
      return res.status(error.statusCode).json({
        status: error.status,
        error,
        message: error.message,
        stack: error.stack,
      });
    }
    //RENDERED WEBSITE
    return res.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      message: error.message,
    });
  },

  sendErrorProduction: (error, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
      if (error.isOperational) {
        return res.status(error.statusCode).json({
          status: error.status,
          message: error.message,
        });
      }
      // console.error('ERROR', error);
      return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
    if (error.isOperational) {
      return res.status(error.statusCode).render('error', {
        title: 'Something went wrong!',
        message: error.message,
      });
    }
    // console.error('ERROR', error);
    return res.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      message: 'Please try again later.',
    });
  },
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  let err = error;
  if (error.name === 'CastError') err = handleCastErrorDB(err);
  if (error.code === 11000) err = handleDuplicateFieldsDB(err);
  if (error.name === 'ValidationError') err = handleValidationErrorDB(err);
  if (error.name === 'JsonWebTokenError') handleJWTError();
  if (error.name === 'TokenExpiredError') handleJWTExpiredError();

  errorHandlers[`sendError${process.env.NODE_ENV}`](err, req, res);
};
