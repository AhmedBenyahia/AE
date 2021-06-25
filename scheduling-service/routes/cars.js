const {Car, validate,carState} = require('../model/car');
const {Agency} = require('../model/agency');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const validateAgencyObjectId = require('../middleware/validateAgencyObjectId');
const authorization = require('../middleware/authorization');
const debugCars = require('debug')('scheduling-service:cars');

// GET ALL
router.get('/:agency',[authorization,validateAgencyObjectId],async (req, res) => {
    res.send(await Car.find({ agency: req.params.agency}));
});

// GET BY ID
router.get('/:id', [authorization,validateObjectId], async (req, res) => {
    const car = await Car.findOne({_id: req.params.id, agency: req.body.agency});
    if (!car) return res.status(404).send({message: ' The car with the giving id was not found'});
    res.send(car);
});

// ADD New Car
router.post('/', authorization,async (req, res) => {
    // validate the request schema
    const {error} = validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message});
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send(
        { message: ' The agency with the giving id was not found'});
    // save the new car
    let car = new Car(req.body);
    car.agency = agency._id;
    await car.save();
    res.send(car);
});

// UPDATE Car
router.put('/:id', [authorization,validateObjectId], async (req, res) => {
    debugCars("Debugging PUT:/car/:id");
    debugCars("    the car id is:", req.params.id);
    // validate the request schema
    const {error} = validate(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency, });
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});
    // update the car with the giving id
    const car = await Car.findOneAndUpdate({ _id: req.params.id, agency: req.body.agency}, req.body, { new: true});
    // if the car wan not found return an error
    if (!car) return res.status(404).send({message: ' The car with the giving id was not found'});
    res.send(car);
});

// DELETE Car
router.delete('/:id', [authorization,validateObjectId], async (req, res) => {
    const car = await Car.findOneAndDelete({ _id: req.params.id, agency: req.body.agency});
    // if the car wan not found return an error
    if (!car) return res.status(404).send({message: ' The car with the giving id was not found'});
    res.send(car);
});
router.put('/suspended/:id', [authorization,validateObjectId], async (req, res) => {
    const car = await Car.findOne({ _id: req.params.id, agency: req.body.agency});
    // if the client wan not found return an error
    if (!car) return res.status(404).send({message: ' The monitor with the giving id was not found'});
    car.state = carState[1];
    await car.save();
    return res.send(car);
});
module.exports = router;
