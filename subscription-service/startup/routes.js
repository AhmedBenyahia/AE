const error = require('../middleware/error');
const authorization = require('../middleware/authorization');

// routes imports goes here
const agency = require('../routes/agencys');
const client  = require('../routes/clients');
const logging = require('../middleware/req-log');


module.exports = (app) => {

// Authorization checking
    app.use(authorization);
// logging middleware
    app.use(logging);
// routes middleware stack goes here
    app.use('/agency', agency);
    app.use('/client', client);
// handling global error
    app.use(error);
};
