const error = require('../middleware/error');
const debug = require('debug')('auth-service:routing');
const auth = require('../routes/authentication')
// routes imports goes here
const user = require('../routes/users')
const logging = require('../middleware/req-log');
const cors = require('cors');


module.exports = (app) => {

    app.use(cors());
    // logging middleware
    app.use(logging);
    // routes middleware stack goes here
    app.use('/auth', auth);
    app.use('/user', user);
    // handling global error
    app.use(error);
};
