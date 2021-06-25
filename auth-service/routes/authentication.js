const express = require('express');
const router = express.Router();
const {User,validateLogin,generateAuthToken} = require('../model/user');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const JoiExtended = require('../startup/validation');
const jwt = require('jsonwebtoken');
const config = require('config');
const authenticationDebug = require('debug')('auth-service:authentication');
const authorization = require('../middleware/authorization')
// User login
router.post('/login', async (req, res) => {
    authenticationDebug('Debugging /login');
    // validate request body
    const {error} = validateLogin(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify if user exist
    const user = await User.findOne({email: req.body.email});
    if(user){
        if(!user.isConfirmed)
            return res.status(400).send({message: 'Your account not confirmed yet'});
        if(!user.isActive)
            return res.status(400).send({message: 'Your account is suspended'});
        if (await bcrypt.compare(req.body.password, user.password))
            return res.send({user:user,authToken:generateAuthToken(user)});
    }

    return res.status(400).send({message: 'Invalid email or password'});
});

// Social media login
router.post('/social-login', async (req, res) => {
    authenticationDebug('Debugging /social-login');
    // validate request body
    const {error} = Joi.object({
        email: JoiExtended.string().emailAdr().min(4).max(55).required(),
        fullName: JoiExtended.string().min(2).max(15).required(),
        phone: JoiExtended.string().phone().required(),
        role: JoiExtended.string().required(),
        avatar: JoiExtended.string().max(255),
    }).validate(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify if user exist
    let user = await User.findOne({email: req.body.email});
    if (!user) {
        user = new User(req.body);
        await user.save();
    }
    return res.send(generateAuthToken(user));
});

// Information about the logged user
router.get('/whoami', authorization, async (req, res) => {
    const user = await User.findOne({email: req.user.email});
    return res.send(user);
});

// Information about the logged user
// We can improve the auth mechanism by sending an id_Token instead of  an access token
router.get('/verify', authorization, async (req, res) => {
    authenticationDebug('Debugging jwt verification');
    authenticationDebug('   req: ', compact(req.method, req.url));
    return res.status(200).send(req.user)
});



function compact(method, url) {
    return method + ':' + url.replace(url.match(/[0-9a-fA-F]{24}$/g), ':id').toLowerCase();
}

module.exports = router;

