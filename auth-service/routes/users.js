const {User, validate, VerificationToken} = require('../model/user');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const debugUsers = require('debug')('scheduling-service:users');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const crypto = require('crypto');
const JoiExtended = require('../startup/validation');
const sendMail = require('../startup/mailer');

// GET ALL
router.get('/', async (req, res) => {
    res.send(await User.find());
});

// GET BY ID
router.get('/:id', validateObjectId, async (req, res) => {
    const user = await User.findOne({_id: req.params.id});
    if (!user) return res.status(404).send({message: ' The user with the giving id was not found'});
    res.send(user);
});

// ADD New User
router.post('/', async (req, res) => {
    // validate the request schema
    const {error} = validate(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify if the email already exist
    if (await User.findOne({email: req.body.email})) {
        return res.status(400).send({message: 'A user with the same email already exist !!'});
    }
    // save the new user
    let user = new User(_.omit(req.body, ['password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    const token = new VerificationToken({
        _userId: user._id,
        token: crypto.randomBytes(12).toString('hex')
    });
    // save the token and the user
    // save the user and the verification token
    await user.save();
    await token.save();
    res.send(user);
});

// UPDATE User
router.put('/:id', validateObjectId, async (req, res) => {
    debugUsers('Debugging PUT:/user/:id');
    debugUsers('    the user id is:', req.params.id);
    // validate the request schema
    const {error} = validate(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // update the user with the giving id
    const user = await User.findOneAndUpdate({_id: req.params.id}, _.omit(req.body, ['password']), {new: true});
    // if the user wan not found return an error
    if (!user) return res.status(404).send({message: ' The user with the giving id was not found'});
    res.send(user);
});

// UPDATE password
router.patch('/password/:id', validateObjectId, async (req, res) => {
    // validate the request schema
    const {error} = JoiExtended.validate(req.body, {
        newPassword: JoiExtended.string().min(8).max(255).required(),
        oldPassword: JoiExtended.string().min(8).max(255).required()
    });
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify if user exist
    let user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(404).send({message: ' The user with the giving id was not found'});
    // verify if the old password is valid
    if (await bcrypt.compare(req.body.oldPassword, user.password)) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword, salt);
        // update the user password
        await user.save();
        return res.send(user);
    }
    // the password is incorrect
    res.status(401).send({message: " Incorrect password!! "});
});

// Suspend the account of a user
router.put('/suspended/:id', validateObjectId, async (req, res) => {
    const user = await User.findOne({_id: req.params.id});
    // if the user wan not found return an error
    if (!user) return res.status(404).send({message: ' The user with the giving id was not found'});
    user.isActive = false;
    await user.save();
    return res.send(user);
});

// Confirm account
router.get('/confirmation/:id',validateObjectId , async (req, res) => {
    debugUsers("Debugging /confirmation/:id");
    // find the token in the database
    const token = await VerificationToken.findOne({token: req.params.id});
    if (!token) return res.status(404).send({message: "Verification token was not found."});
    // find a matching user
    const user = await User.findOne({_id: token._userId});
    if (!user) return res.status(404).send({message: "no user Match the giving token"});
    // verify if the user already verified
    if (user.isConfirmed) return res.status(400).send({message: "account already verified"});
    // everything is Ok => confirm the user account
    user.isConfirmed = true;
    await user.save();
    await token.remove(); //TODO change this so the token expire on his own
    res.send({message: 'Account has been verified, please login.'});
});

// Resend Token
router.get('/token/resend', async (req, res) => {
    debugUsers("Debugging /token/resend");
    // verify the req body
    if (!req.body.email) return res.status(400).send({message: "Email is required"});
    // find a matching user
    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(404).send({message: "No user match the giving email"});
    // find the token in the database
    const token = await VerificationToken.findOne({_userId: user._id});
    if (!token) return res.status(404).send({message: "Verification token not found!!"});
    // send the verification token by mail to user
    // sendMail(user.email,
    //     'Confirmation de compte', //TODO: send a link to angular component
    //     'Bonjour Veuillez vérifier votre compte en cliquant sur le lien suivant: <br>' +
    //     `http://${config.get('frontendUrl')}/user/confirmation/` + token.token);
    res.send({message: "The confirmation mail has been send!" + token.token});
});

// DELETE User
router.delete('/:id', validateObjectId, async (req, res) => {
    const user = await User.findOneAndDelete({_id: req.params.id});
    // if the user wan not found return an error
    if (!user) return res.status(404).send({message: ' The user with the giving id was not found'});
    res.send(user);
});
module.exports = router;
