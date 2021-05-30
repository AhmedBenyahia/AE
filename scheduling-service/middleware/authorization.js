const debug = require('debug')('auth-service:authorization-middleware');
const config = require('config');
const jwt = require('jsonwebtoken');
const {User} = require('../model/user');

module.exports =async function (req, res, next) {
    debug('Verifying JWT token')
    // verify the existence of the token
    const token = req.header('Authorization');
    if (!token) return res.status(401).send({message:'Access denied. No token provided'});
    // verify the validation of the token
    try {
        req.user = jwt.verify(token.split(' ')[1], config.get('jwtPrivateKey'));
        debug('   Token payload: user role is', req.user.role);
        const user = await User.findOne({email: req.user.email});
        //todo test
        if (!user ) return res.status(401).send({message: 'User not found'});
        if(!user.isActive) return res.status(401).send({message: 'Your account is suspended'});
        if(!user.isConfirmed) return res.status(401).send({message: 'Your account not confirmed yet'});
        next()
    } catch(err) {
        return res.status(401).send({message:' Access denied. Invalid token'}) ;
    }
};
