const {User, validate,validateForgotPassword,validateResetPassword,VerificationToken,rolesEnum} = require('../model/user');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const debugUsers = require('debug')('scheduling-service:users');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const crypto = require('crypto');
const JoiExtended = require('../startup/validation');
const sendMail = require('../startup/mailer');
const transporter = require('../startup/nodemailer');
const config = require('config');
const confirmationMailTempalte=require('../helper/confirmation-account-mail-template')
const forgotPasswordMailTempalte=require('../helper/forgot-password-mail-template')



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
    user.role=rolesEnum[1];
    const token = new VerificationToken({
        _userId: user._id,
        token: crypto.randomBytes(12).toString('hex')
    });
    // save the token and the user
    // save the user and the verification token
    try{
        await user.save();
        await token.save();
        await transporter.sendMail({
            from: 'DrivingScholls@gmail.com',
            to: user.email,
            subject: "Account Confirmation ✔",
            text: "Hello world?", // plain text body
            html:confirmationMailTempalte(config.get('frontendUrl')+"user/confirmation/"+token.token)
        });

    }catch(err){
        return res.status(400).send({message: err.message});

    }

    res.send(user);
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

// FORGOT PASSWORD
router.post('/forgotPassword',async (req, res) => {
    // validate the request schema
    const {error} = validateForgotPassword(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify if the email already exist
    const user=await User.findOne({email: req.body.email});
    if(!user) return res.status(404).send({message:"No user Match the giving email"});
    // save the new user
    const token = new VerificationToken({
        _userId: user._id,
        token: crypto.randomBytes(12).toString('hex')
    });
    // save the token and the user
    // save the user and the verification token
    try{
        await token.save();
        await transporter.sendMail({
            from: 'DrivingScholls@gmail.com',
            to: user.email,
            subject: "Forgot Password ",
            html: forgotPasswordMailTempalte(config.get('frontendUrl')+"user/resetPassword/"+token.token,user.fullName)
        });
    }catch(err){
        return res.status(400).send({message: err.message});

    }

    res.send(user);
});

// RESET PASSWORD
router.post('/resetPassword/:id', validateObjectId,async (req, res) => {
    // validate the request schema
    const {error} = validateResetPassword(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});

    const token = await VerificationToken.findOne({token: req.params.id});
    if (!token) return res.status(404).send({message: "Reset token was not found."});
    // verify if the email already exist
    const user = await User.findOne({_id: token._userId});
    if(!user) return res.status(404).send({message:"No user Match the giving token"});
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
    await user.save()
    await token.remove();
    res.send(user);
});

module.exports = router;
