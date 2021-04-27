const {Client, validate, clientState, VerificationToken} = require('../model/client');
const {Agency} = require('../model/agency');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const bcrypt = require("bcrypt");
const Joi = require('joi');
const _ = require('lodash')
const JoiExtended = require('../startup/validation');
const clientDebug = require('debug')('subscription-service:client');
const sendMail = require('../startup/mailer');
const crypto = require('crypto');
// const {newClientNotif} = require('../middleware/notify');
const Fawn = require('fawn');
const mongoose = require('mongoose');
const config = require('config');

//init the atomic task lib
Fawn.init(mongoose);

// GET ALL
router.get('/', async (req, res) => {
    // The agency id should be fetch for the current log in user !!
        res.send(await Client.find({ agency: req.body.agency}));
});

// GET BY ID
router.get('/:id', validateObjectId, async (req, res) => {
    const client = await Client.findOne({_id: req.params.id, agency: req.body.agency});
    if (!client) return res.status(404).send({message: ' The client with the giving id was not found'});
    res.send(client);
});

// Client Register
router.post('/', async (req, res) => {
    clientDebug('POST:/client');
    // validate the request schema
    const {error} = validate(req.body, true);
    if (error) return res.status(400).send({
        message: error.details[0].message
    });
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});
    // create new Client obj
    const client = new Client(_.omit(req.body,['password']));
    const salt = await bcrypt.genSalt(10);
    client.password = await bcrypt.hash(req.body.password, salt);
    //  create new verification token in the database
    const token = new VerificationToken({
        _clientId: client._id,
        token: crypto.randomBytes(12).toString('hex')
    }); //check list
    // save the token and the client
    // save the client and the verification token
    // TODO: add "for" att to token to identify the reason for this token
        await new Fawn.Task()
            .save('tokens', token)
            .save('clients', client)
            .run();

    // send the verification token by mail to client
    sendMail(client.email,
        'Confirmation de compte', //TODO: send a link to angular component
        'Bonjour Veuillez vérifier votre compte en cliquant sur le lien suivant: <br>' +
        `http://${config.get('frontendUrl')}/client/confirmation/` + token.token);
    // await newClientNotif(req, client);
    return res.send(client);
});

// UPDATE Client
router.put('/:id', validateObjectId, async (req, res) => {
    // validate the request schema
    const {error} = validate(req.body, false);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});
    // verify if we are updating the password
    // update the client with the giving id
    const client = await Client.findOneAndUpdate({ _id: req.params.id, agency: req.body.agency}, req.body, { new: true});
    // if the client wan not found return an error
    if (!client)
        return res.status(404).send({message: ' The client with the giving id was not found'});
    return res.send(client);
});

// UPDATE the password
router.patch('/password/:id', validateObjectId, async (req, res) => {
    // validate the request schema
    const {error} = Joi.object({
        newPassword: Joi.string().min(8).max(255).required(),
        oldPassword: Joi.string().min(8).max(255).required(),
        agency: JoiExtended.string().objectId().required(),
    }).validate(req.body);
    if (error) return res.status(400).send({
        message: error.details[0].message
    });
    // verify if client exist
    let client = await Client.findOne({ _id: req.params.id, agency: req.body.agency });
    if (!client) return res.status(404).send({message: ' The client with the giving id was not found'});
    // verify if the old password is valid
    if (await bcrypt.compare(req.body.oldPassword, client.password)) {
        const salt = await bcrypt.genSalt(10);
        client.password = await bcrypt.hash(req.body.newPassword, salt);
        // update the client password
        await client.save();
        return res.send(client);
    }
    // the password is incorrect
    res.status(401).send({message: " Incorrect password!! "});
});

// DELETE Client
router.delete('/:id', validateObjectId, async (req, res) => {
    const client = await Client.findOneAndDelete({ _id: req.params.id, agency: req.body.agency});
    // if the client wan not found return an error
    if (!client) return res.status(404).send({message: ' The client with the giving id was not found'});
    return res.send(client);
});

// suspend the account of a client
router.put('/suspended/:id', validateObjectId, async (req, res) => {
    const client = await Client.findOne({_id: req.params.id});
    // if the client wan not found return an error
    if (!client) return res.status(404).send({message: ' The client with the giving id was not found'});
    client.state = clientState[6];
    await client.save();
    return res.send(client);
});

// Confirm account
router.get('/confirmation/:id',validateObjectId , async (req, res) => {
    clientDebug("Debugging /confirmation/:id");
    // find the token in the database
    const token = await VerificationToken.findOne({token: req.params.id});
    if (!token) return res.status(404).send({message: "verification token not find!!"});
    //find a matching client
    const client = await Client.findOne({_id: token._clientId});
    if (!client) return res.status(404).send({message: "no client natch the giving token"});
    // verify if the user already verified
    if (client.state !== clientState[0]) return res.status(400).send({message: "account already verified"});
    //everything is Ok => confirm the client account
    client.state = clientState[1];
    await client.save();
    await token.remove(); //TODO change this so the token expire on his own
    res.send({message: 'account verified please log in!'});
});

// Resend Token
router.get('/token/resend', async (req, res) => {
    clientDebug("Debugging /token/resend");
    // verify the req body
    if (!req.body.email) return res.status(400).send({message: "email is required"});
    //find a matching client
    const client = await Client.findOne({email: req.body.email});
    if (!client) return res.status(404).send({message: "no client match the giving email"});
    // find the token in the data base
    const token = await VerificationToken.findOne({_clientId: client._id});
    if (!token) return res.status(404).send({message: "verification token not found!!"});
    // send the verification token by mail to client
    sendMail(client.email,
        'Confirmation de compte', //TODO: send a link to angular component
        'Bonjour Veuillez vérifier votre compte en cliquant sur le lien suivant: <br>' +
        `http://${config.get('frontendUrl')}/client/confirmation/` + token.token);
    res.send({message: "the confirmation mail has been send!"});
});

// Request password Reset
router.post('/password/reset', async (req, res) => {
    clientDebug("Debugging /password/reset");
    // verify the req body
    if (!req.body.email) return res.status(400).send({message: "email is required"});
    //find a matching client
    const client = await Client.findOne({email: req.body.email});
    if (!client) return res.status(404).send({message: "no client match the giving email"});
    //create a token for password reset in the database
    const token = new VerificationToken({
        _clientId: client._id,
        token: crypto.randomBytes(12).toString('hex')
    });
    token.save();
    // send the verification token by mail to client
    sendMail(client.email,
        'Récupération de mot de pass',
        'Bonjour une demande de récupération de votre mot de pass a ete envoyer: <br>' +
        `http://${config.get('frontendUrl')}/client/password/reset/` + token.token);
    res.send({message: "Reset password mail has been sent"});
});

// Password Reset
router.patch('/password/reset/:id', async (req, res) => {
    clientDebug("Debugging /password/reset/:id");
    // find the token in the database
    const token = await VerificationToken.findOne({token: req.params.id});
    if (!token) return res.status(404).send({message: "no token found!!"});
    // validate the request schema
    const {error} = Joi.object( {
        password: Joi.string().min(8).max(255).required(),
    }).validate(req.body);
    if (error) return res.status(400).send({
        message: error.details[0].message
    });
    // verify if client exist
    let client = await Client.findOne({_id: token._clientId});
    if (!client) return res.status(404).send({message: ' Client not Found'});
    // update the client password
    const salt = await bcrypt.genSalt(10);
    client.password = await bcrypt.hash(req.body.password, salt);
    await client.save();
    await token.remove();
    return res.send({message: 'password has been updated'});
});
module.exports = router;
