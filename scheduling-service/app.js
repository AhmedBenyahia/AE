const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const eurekaHelper = require('./helper/eureka-helper');
const fileUpload = require('express-fileupload');

const app = express();
require('./startup/config')(app);
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/prod')(app);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());

// import the logger and the FN to convert global rejection to exception
const { handleRejection } = require('./startup/logging');
handleRejection();

// Register the service in eureka register
// TODO: uncomment this in prod
// eurekaHelper.registerWithEureka('scheduling-service', process.env.PORT || '3000');



module.exports = app;
