const error = require('../middleware/error');
const debug = require('debug')('auth-service:routing');
const {auth, claimEquals, claimIncludes, claimCheck,} = require ('express-openid-connect');
const  {requiresAuth} = require ('express-openid-connect');
// routes imports goes here
const user = require('../routes/users')
const logging = require('../middleware/req-log');


const cors = require('cors');

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: 'a long, randomly-generated string stored in env',
    clientSecret: 'CJWWZceBXXw18JEKcxpjQKYZ15hhbySfSoCDv0qZGSOI0edjJXflqUG1LQYAV-PM',
    baseURL: 'http://localhost:3000',
    clientID: 'd8Q6NjdtQt69KHypYoZiW2AeQRA5O9Cz',
    issuerBaseURL: 'https://sayto.eu.auth0.com/',
    authorizationParams: {
        response_type: 'code',
        audience: 'http://localhost:3004',
        scope: 'openid profile email offline_access read:calendar',
    }
};

module.exports = (app) => {

    app.use(cors());
    // logging middleware
    app.use(logging);


    // auth router attaches /login, /logout, and /callback routes to the baseURL
    app.use(auth(config));

    // Middleware to make the `user` object available for all views
    app.use((req, res, next) => {
        res.locals.user = req.oidc.user;
        if (req.oidc.accessToken) {
            let {token_type, access_token} = req.oidc.accessToken;
            debug(`Authorization: ${token_type} ${access_token}`)
        }
        next();
    });

    // req.isAuthenticated is provided from the auth router
    app.get('/', (req, res) => {
        res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
    });

    app.get('/profile', requiresAuth(), (req, res) => {
        res.send(JSON.stringify(req.oidc.user));
    });

    app.get('/verify', requiresAuth(), (req, res) => {
        res.send(JSON.stringify(req.oidc.user));
    });

    // routes middleware stack goes here
    app.use('/user', user);
    // handling global error
    app.use(error);
};
