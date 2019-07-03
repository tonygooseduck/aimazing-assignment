const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const outletsRouter = require('./controllers/outlets.js');
const transactionsRouter = require('./controllers/transactions.js');
const usersRouter = require('./controllers/users.js');
const loginRouter = require('./controllers/login.js');
const middleware = require('./utils/middleware.js');

const db = require('./models/db.js');

app.use(bodyParser.json());
//app.use(middleware.requestLogger);

//api
app.use(express.static('public'));
app.use('/api/login', loginRouter);
app.use('/api/outlets', outletsRouter);
app.use('/api/users', usersRouter);
app.use('/api/transactions', transactionsRouter);

module.exports = app;