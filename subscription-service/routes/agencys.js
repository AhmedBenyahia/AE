const express = require('express');
const router = express.Router();
const {Agency, validate} = require('../model/agency');
const {Manager} =require('../model/manager');
const bcrypt = require("bcrypt");
const usernameGenerator = require('username-generator');
const  passwordGenerator = require('generate-password');
const sendMail = require('../startup/mailer');
const debug = require('debug')('subscription-service:agency');

router.get('/', async (req, res) => {
    res.send(await Agency.find());
});

/**
 * Create new agency with default manager. The credential of the newly created manager will be sent by email
 * TODO: update the fn to user the mail service and manager service.
 */
router.post('/', async (req, res) => {
    // validate the request body
    const {error} = validate(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // create new agency instance
    const agency = new Agency(req.body);
    // save the new agency in the database
    await agency.save();
    // generate a password and hash it
    const password = passwordGenerator.generate({ length: 10, numbers: true });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    // create new manager
    const manager = new Manager({
        username: usernameGenerator.generateUsername('-'),
        email: agency.email,
        password: passwordHash,
        role: "admin",
        agency: agency._id
    });
    // send the manager connection information by mail to the super admin
    sendMail(agency.email,
        'Ajout d\' un nouveau Manager',
        'Un nouveau agence auto-ecole a ete ajouter, the admin information are: <br>' +
        `Title: ${agency.title}, email: ${agency.email} <br>` +
        `Username: ${manager.username} Password: ${password} <br>`);
    // save the manager in database
    await manager.save();
    debug(`The generated manager credentials are: pass(${password}) user(${manager.username})`)
    res.send(agency);
});


module.exports = router;
