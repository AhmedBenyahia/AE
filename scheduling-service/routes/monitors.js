const {Monitor, validate} = require('../model/monitor');
const {Agency} = require('../model/agency');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const usernameGenerator = require('username-generator');
const  passwordGenerator = require('generate-password');
const bcrypt = require("bcrypt");
const Joi =require('joi');
const sendMail = require('../startup/mailer');
const config = require('config');

// GET ALL
router.get('/', async (req, res) => {
    res.send(await Monitor.find({ agency: req.body.agency}));
});

// GET BY ID
router.get('/:id', validateObjectId, async (req, res) => {
    const monitor = await Monitor.findOne({_id: req.params.id, agency: req.body.agency});
    if (!monitor) return res.status(404).send({message: ' The monitor with the giving id was not found'});
    res.send(monitor);
});

// ADD New Monitor
router.post('/', async (req, res) => {
    // validate the request schema
    const {error} = validate(req.body, true);
    if (error) return res.status(400)
        .send({message: error.details[0].message});
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});
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
        // send mail to admin with the username and password of the added monitor
    sendMail(config.get('email'),
          'Ajout d\' un nouveau moniteur',
           'Un nouveau moniteur  a ete ajouter: <br>' +
                `Nom: ${monitor.name}, prenom: ${monitor.surname} <br>` +
                `Username: ${monitor.username} Password: ${password} <br>`);
    // send the new monitor object to the client with the password in plain  text
    //TODO: remove this
    monitor.password = password;
    res.send(monitor);
});

// UPDATE the password
router.patch('/password/:id', validateObjectId, async (req, res) => {
    // validate the request schema
    const {error} = Joi.object( {
        newPassword: Joi.string().min(8).max(255).required(),
        oldPassword: Joi.string().min(8).max(255).required(),
        agency: Joi.string().required(),
    }).validate(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify if monitor exist
    let monitor = await Monitor.findOne({ _id: req.params.id, agency: req.body.agency });
    if (!monitor) return res.status(404).send({message: ' The monitor with the giving id was not found'});
    // verify if the old password is valid
    if (await bcrypt.compare(req.body.oldPassword, monitor.password)) {
        const salt = await bcrypt.genSalt(10);
        monitor.password = await bcrypt.hash(req.body.newPassword, salt);
        // update the monitor password
        await monitor.save();
        return res.send(monitor);
    }
    // the password is incorrect
    res.status(401).send({message: " Incorrect password!! "});
});

// UPDATE Monitor
router.put('/:id', validateObjectId, async (req, res) => {
    // validate the request schema
    const {error} = validate(req.body, false);
    if (error) return res.status(400).send({
        message: error.details[0].message
    });
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});
    // update the monitor with the giving id
    const monitor = await Monitor.findOneAndUpdate({ _id: req.params.id, agency: req.body.agency}, req.body, { new: true});
    // if the monitor wan not found return an error
    if (!monitor) return res.status(404).send({message: ' The monitor with the giving id was not found'});
    res.send(monitor);
});

// DELETE Monitor
router.delete('/:id', validateObjectId, async (req, res) => {
    const monitor = await Monitor.findOneAndDelete({ _id: req.params.id, agency: req.body.agency});
    // if the monitor wan not found return an error
    if (!monitor) return res.status(404).send({message: ' The monitor with the giving id was not found'});
    res.send(monitor);
});
module.exports = router;
