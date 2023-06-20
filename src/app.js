const express = require('express');
const app = express();
const { usersRouter, indexRouter } = require('./routes/index');
require('dotenv').config();

app.use(express.json());
app.use('/', indexRouter);

// this will call user.json(route)

app.use('/users', usersRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
