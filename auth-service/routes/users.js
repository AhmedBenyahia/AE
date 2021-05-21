const {User, validate} = require('../model/user');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const debugUsers = require('debug')('scheduling-service:users');

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
    if (error) return res.status(400).send({ message: error.details[0].message});
    // save the new user
    let user = new User(req.body);
    // user.agency = agency._id;
    await user.save();
    res.send(user);
});

// UPDATE User
router.put('/:id', validateObjectId, async (req, res) => {
    debugUsers("Debugging PUT:/user/:id");
    debugUsers("    the user id is:", req.params.id);
    // validate the request schema
    const {error} = validate(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // update the user with the giving id
    const user = await User.findOneAndUpdate({ _id: req.params.id}, req.body, { new: true});
    // if the user wan not found return an error
    if (!user) return res.status(404).send({message: ' The user with the giving id was not found'});
    res.send(user);
});

// DELETE User
router.delete('/:id', validateObjectId, async (req, res) => {
    const user = await User.findOneAndDelete({ _id: req.params.id});
    // if the user wan not found return an error
    if (!user) return res.status(404).send({message: ' The user with the giving id was not found'});
    res.send(user);
});
module.exports = router;
