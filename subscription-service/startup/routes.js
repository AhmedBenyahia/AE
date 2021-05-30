const error = require('../middleware/error');
// const authorization = require('../middleware/authorization');
const express = require('express');

// routes imports goes here
const agency = require('../routes/agencys');
const client  = require('../routes/clients');
const user  = require('../routes/users');
const admin=require('../routes/admin')
// const authentication  = require('../routes/authentication');
// const manager  = require('../routes/managers');
// const document  = require('../routes/document');
// const absence = require('../routes/absences');
// const breakdown = require('../routes/breakdowns');
const logging = require('../middleware/req-log');
// const notif = require('../routes/notifs');


module.exports = (app) => {

// Authorization checking
    app.use(express.json()) ;
    // app.use(authorization);
// logging middleware
    app.use(logging);
// routes middleware stack goes here
    app.use('/agency', agency);
    // app.use('/car', car);
    app.use('/client', client);
    app.use('/user', user);
    app.use('/admin', admin);
    // app.use('/monitor', monitor);
    // app.use('/session', session);
    // app.use('/', authentication);
    // app.use('/manager', manager);
    // app.use('/', document);
    // app.use('/exam', exam);
// handling global error
    app.use(error);
};
