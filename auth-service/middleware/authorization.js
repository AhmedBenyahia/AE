const debug = require('debug')('auth-service:authorization-middleware');
const config = require('config');
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    debug('Verifying JWT token')
    // verify the existence of the token
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access denied. No token provided');
    // verify the validation of the token
    try {
        req.user = jwt.verify(token.split(' ')[1], config.get('jwtPrivateKey'));
        debug('   Token payload: user role is', req.user.role);
        next()
    } catch(err) {
        return res.status(400).send(' Invalid token.') ;
    }
};
