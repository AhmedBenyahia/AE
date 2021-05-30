const {Monitor, validate,monitorState} = require('../model/monitor');
const {Agency} = require('../model/agency');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const validateAgencyObjectId = require('../middleware/validateAgencyObjectId');
const authorization = require('../middleware/authorization');
const usernameGenerator = require('username-generator');
const  passwordGenerator = require('generate-password');
const bcrypt = require("bcrypt");
const Joi =require('joi');
const sendMail = require('../startup/mailer');
const config = require('config');

// GET ALL
router.get('/:agency', [authorization,validateAgencyObjectId],async (req, res) => {
    res.send(await Monitor.find({ agency: req.params.agency}));
});

// GET BY ID
router.get('/:agency/:id', [authorization,validateAgencyObjectId,validateObjectId], async (req, res) => {
    const monitor = await Monitor.findOne({_id: req.params.id, agency: req.params.agency});
    if (!monitor) return res.status(404).send({message: ' The monitor with the giving id was not found'});
    res.send(monitor);
});

// ADD New Monitor
router.post('/', authorization,async (req, res) => {
    // validate the request schema
    const {error} = validate(req.body, true);
    if (error) return res.status(400)
        .send({message: error.details[0].message});
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});

    const existCredentials=await Monitor.findOne({'cin':req.body.cin});
    if(existCredentials!==null) return res.status(409).send("The Monitor already exist")

    // save the new monitor
    const monitor = new Monitor(req.body);
        //generate a username
    monitor.username = usernameGenerator.generateUsername("-");
    const salt = await bcrypt.genSalt(10);
        // generate a password and hash it
    const password = passwordGenerator.generate({length: 8, numbers: true});
    monitor.password = await bcrypt.hash(password, salt);
    monitor.agency = agency._id;
        // save in the db
    await monitor.save();

    res.send(monitor);
});

// UPDATE Monitor
router.put('/:id', [authorization,validateObjectId], async (req, res) => {

    // validate the request schema
    const {error} = validate(req.body, false);
    if (error) return res.status(400).send({
        message: error.details[0].message
    });
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});

    let monitor = await Monitor.findOne({ _id: req.params.id, agency: req.body.agency});
    if(monitor){

        const existWithUserCin=await Monitor.findOne({'cin':req.body.cin});
        if(  existWithUserCin!==null && !monitor._id.equals(existWithUserCin._id) )
            return res.status(409).send("Other monitor already has these credentials");
    }

    // update the monitor with the giving id
     monitor = await Monitor.findOneAndUpdate({ _id: req.params.id, agency: req.body.agency}, req.body, { new: true});
    // if the monitor wan not found return an error
    if (!monitor) return res.status(404).send({message: ' The monitor with the giving id was not found'});
    res.send(monitor);
});

// DELETE Monitor
router.delete('/:id', [authorization,validateObjectId], async (req, res) => {
    const monitor = await Monitor.findOneAndDelete({ _id: req.params.id, agency: req.body.agency});
    // if the monitor wan not found return an error
    if (!monitor) return res.status(404).send({message: ' The monitor with the giving id was not found'});
    res.send(monitor);
});


router.put('/suspended/:id', [authorization,validateObjectId], async (req, res) => {
    const monitor = await Monitor.findOne({ _id: req.params.id, agency: req.body.agency});
    // if the client wan not found return an error
    if (!monitor) return res.status(404).send({message: ' The monitor with the giving id was not found'});
    monitor.state = monitorState[2];
    await monitor.save();
    return res.send(monitor);
});
module.exports = router;
