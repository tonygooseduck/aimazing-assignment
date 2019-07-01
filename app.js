const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const outletsRouter = require('./controllers/outlets.js');
const middleware = require('./utils/middleware.js');

const db = require('./models/db.js');

app.use(bodyParser.json());
app.use(middleware.requestLogger);

//api
app.use('/api/outlets', outletsRouter);

module.exports = app;