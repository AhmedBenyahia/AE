const  express = require ('express');
const  logger = require ('morgan');
const {auth, claimEquals, claimIncludes, claimCheck,} = require ('express-openid-connect');
const  {requiresAuth} = require ('express-openid-connect');
const eurekaHelper = require('./helper/eureka-helper');

const app = express();

app.use(logger('dev'));
app.use(express.json());

require('./startup/config')(app);
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/prod')(app);

// import the logger and the FN to convert global rejection to exception
const { handleRejection } = require('./startup/logging');
handleRejection();





// Register the service in eureka register
eurekaHelper.registerWithEureka('auth-service', process.env.PORT || '3000');

module.exports = app;
