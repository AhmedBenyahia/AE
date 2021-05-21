const error = require('../middleware/error');
const authorization = require('../middleware/authorization');
const express = require('express');
const debug = require('debug')('scheduling-service:routing');

// routes imports goes here
const car = require('../routes/cars');
// const client  = require('../routes/clients');
const monitor = require('../routes/monitors');
const session = require('../routes/sessions');
// const authentication  = require('../routes/authentication');
// const manager  = require('../routes/managers');
// const document  = require('../routes/document');
const exam = require('../routes/exams');
// const absence = require('../routes/absences');
// const breakdown = require('../routes/breakdowns');
const logging = require('../middleware/req-log');
// const notif = require('../routes/notifs');

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const cors = require('cors');

const {auth} = require('express-openid-connect');
const {requiresAuth} = require('express-openid-connect');

// const config = {
//     authRequired: false,
//     auth0Logout: true,
//     secret: 'a long, randomly-generated string stored in env',
//     baseURL: 'http://localhost:3004',
//     clientID: 'd8Q6NjdtQt69KHypYoZiW2AeQRA5O9Cz',
//     issuerBaseURL: 'https://sayto.eu.auth0.com'
// };


module.exports = (app) => {
    // auth router attaches /login, /logout, and /callback routes to the baseURL
    // app.use(auth(config));

    // // req.isAuthenticated is provided from the auth router
    // app.get('/', (req, res) => {
    //     res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
    // });
    //
    //
    // app.get('/profile', requiresAuth(), (req, res) => {
    //     res.send(JSON.stringify(req.oidc.user));
    // });


    // require('dotenv').config();
    //
    // const port = process.env.CALENDAR_API_PORT;
    // const domain = process.env.AUTH0_DOMAIN;

    app.use(cors());

// Validate the access token and enable the use of the jwtCheck middleware
    app.use(jwt({
        // Dynamically provide a signing key based on the kid in the header
        // and the singing keys provided by the JWKS endpoint
        secret: jwksRsa.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: 'https://sayto.eu.auth0.com/.well-known/jwks.json'
        }),
        audience: 'http://localhost:3004',
        issuer: 'https://sayto.eu.auth0.com/',
        algorithms: ['RS256']
    }));

//middleware to check scopes
    const checkPermissions = function (req, res, next) {
        console.log('Checking permissions')
        switch (req.path) {
            case '/api/appointments': {
                var permissions = ['read:calendar'];
                for (var i = 0; i < permissions.length; i++) {
                    if (req.user.scope.includes(permissions[i])) {
                        next();
                    } else {
                        res.status(403).send({message: 'Forbidden'});
                    }
                }
                break;
            }
        }
    }

    app.use(checkPermissions);

    app.get('/api/appointments', function (req, res) {
        res.send({
            appointments: [
                {title: '1 on 1', time: 'Mon Nov 14 2016 14:30:00 GMT-0500 (EST)'},
                {title: 'All Hands', time: 'Thurs Nov 14 2016 14:23:20 GMT-0500 (EST)'}
            ]
        });
    });

// Authorization checking
//     app.use(express.json());
//     app.use(authorization);
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
// handling global error
    app.use(error);
};
