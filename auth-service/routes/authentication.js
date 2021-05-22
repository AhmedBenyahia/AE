const express = require('express');
const router = express.Router();
const {User} = require('../model/user');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');
const authenticationDebug = require('debug')('auth-service:authentication');

// User login
router.post('/login', async (req, res) => {
    authenticationDebug('Debugging /login');
    // validate request body
    const {error} = validate(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify if user exist
    const user = await User.findOne({email: req.body.email});
    if (user && await bcrypt.compare(req.body.password, user.password)) {
        return res.send(generateAuthToken(user));
    }
    return res.status(400).send({message: 'Invalid email or password'});
});

// Information about the login user
router.get('/whoami', async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    return res.send(user);
});


function validate(req) {
    const schema = Joi.object({
        email: Joi.string().min(4).max(55).required(),
        password: Joi.string().min(8).max(255).required()
    });
    return schema.validate(req);
}

function generateAuthToken(user) {
    return jwt.sign({
            _id: user._id,
            email: user.email,
            role: user.role,
            agency: user.agency,
        }, config.get('jwtPrivateKey').toString()
    );
}

module.exports = router;

