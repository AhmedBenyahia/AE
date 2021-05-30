const {Client, validate, clientState, VerificationToken} = require('../model/client');
const {Agency} = require('../model/agency');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const validateAgencyObjectId = require('../middleware/validateAgencyObjectId');
const authorization = require('../middleware/authorization');

const bcrypt = require("bcrypt");
const _ = require('lodash')
const crypto = require('crypto');
const Fawn = require('fawn');
const mongoose = require('mongoose');
Fawn.init(mongoose);

// GET ALL
router.get('/:agency', [authorization,validateAgencyObjectId],async (req, res) => {
    // The agency id should be fetch for the current log in user !!
        res.send(await Client.find({ agency: req.params.agency}));
});

// GET BY ID
router.get('/:agency/:id',[authorization,validateAgencyObjectId,validateObjectId], async (req, res) => {
    const client = await Client.findOne({_id: req.params.id, agency: req.params.agency});
    if (!client) return res.status(404).send({message: ' The client with the giving id was not found'});
    res.send(client);
});

// Client Register
router.post('/', authorization,async (req, res) => {
  // return res.status(300).send(req.body);

    //clientDebug('POST:/client');
    // validate the request schema
    const {error} = validate(req.body, true);
    if (error) return res.status(400).send({
        message: error.details[0].message
    });
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});

    const existCredentials=await Client.findOne({$or:[{'username':req.body.username},{'cin':req.body.cin},{'email':req.body.email}]});
    if(existCredentials!==null) return res.status(409).send("The customer already exist")

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

    return res.send(client);
});

// UPDATE Client
router.put('/:id', [authorization,validateObjectId], async (req, res) => {
    // validate the request schema
    const {error} = validate(req.body, false);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});

    let client = await Client.findOne({ _id: req.params.id, agency: req.body.agency});
    if(client){

        const existWithUserName=await Client.findOne({'username':req.body.username});
        const existWithUserCin=await Client.findOne({'cin':req.body.cin});
        const existWithUserEmail=await Client.findOne({'email':req.body.email});
        if( (existWithUserName!==null && !client._id.equals(existWithUserName._id)) || (existWithUserCin!==null && !client._id.equals(existWithUserCin._id)) || (existWithUserEmail!==null && !client._id.equals(existWithUserEmail._id)))
            return res.status(409).send("Other customer already has these credentials");
    }

    // verify if we are updating the password
    // update the client with the giving id
     client = await Client.findOneAndUpdate({ _id: req.params.id, agency: req.body.agency}, req.body, { new: true});
    // if the client wan not found return an error
    if (!client)
        return res.status(404).send({message: ' The customer with the giving id was not found'});
    return res.send(client);
});

// DELETE Client
router.delete('/:id', [authorization,validateObjectId], async (req, res) => {
    const client = await Client.findOneAndDelete({ _id: req.params.id, agency: req.body.agency});
    // if the client wan not found return an error
    if (!client) return res.status(404).send({message: ' The client with the giving id was not found'});
    return res.send(client);
});

// suspend the account of a client
router.put('/suspended/:id', [authorization,validateObjectId], async (req, res) => {
    const client = await Client.findOne({ _id: req.params.id, agency: req.body.agency});
    // if the client wan not found return an error
    if (!client) return res.status(404).send({message: ' The client with the giving id was not found'});
    client.state = clientState[6];
    await client.save();
    return res.send(client);
});

module.exports = router;
