const error = require('../middleware/error');
// const authorization = require('../middleware/authorization');
const express = require('express');

// routes imports goes here
const car  = require('../routes/cars');
// const client  = require('../routes/clients');
const monitor  = require('../routes/monitors');
const session  = require('../routes/sessions');
const statistic = require('../routes/statistics');
// const authentication  = require('../routes/authentication');
// const manager  = require('../routes/managers');
// const document  = require('../routes/document');
const exam = require('../routes/exams');

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
    app.use('/car', car);
    // app.use('/client', client);
    app.use('/monitor', monitor);
    app.use('/session', session);
    // app.use('/', authentication);
    // app.use('/manager', manager);
    // app.use('/', document);
    app.use('/exam', exam);
    app.use('/statistic', statistic);
// handling global error
    app.use(error);
};
