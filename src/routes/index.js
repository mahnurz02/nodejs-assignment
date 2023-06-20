const express = require('express');
const router = express.Router();

// Import route files
const usersRouter = require('./users');

// Define routes for users

router.use('/users', usersRouter);

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

module.exports = {
  indexRouter: router,
  usersRouter,
};
