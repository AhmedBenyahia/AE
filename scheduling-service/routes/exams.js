const {
    Exam, validatesScheduled, succeedExam,
    failedExam, examState, validateUpdate
} = require('../model/exam');
const {Agency} = require('../model/agency');
const {Client, clientState} = require('../model/client');
const {Monitor} = require('../model/monitor');
const {Car} = require('../model/car');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const _ = require('lodash');
const examDebug = require('debug')('app:exam');
const DAY = 24*60*60*1000;
const {newExamNotif} = require('../middleware/notify');
// GET ALL
router.get('/', async (req, res) => {
    res.send(await Exam.find({agency: req.user.agency}));
});

// GET BY ID
router.get('/:id', validateObjectId, async (req, res) => {
    const exam = await Exam.findOne({_id: req.params.id, agency: req.user.agency});
    if (!exam) return res.status(404).send({message: ' The exam with the giving id was not found'});
    res.send(exam);
});

// GET Client exam
// GET Monitor exam

// Add new Exam
router.post('/scheduled', async (req, res) => {
    examDebug('debugging /exam endpoint');
    // validate the request schema
    const {error} = validatesScheduled(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.user.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});
    // verify that the client exist
    const client = await Client.findOne({_id: req.body.clientId, agency: req.user.agency});
    if (!client) return res.status(404).send({message: ' The client with the giving id was not found'});
    // verify that the client doesn't have a reservation in the same date and it's APPROVED
    const monitor = await Monitor.findOne({_id: req.body.monitorId, agency: req.user.agency});
    if (!monitor) return res.status(404).send({message: ' The monitor with the giving id was not found'});
    // verify the car ..
     const car = await Car.findOne({_id: req.body.carId, agency: req.user.agency});
    if (!car) return res.status(404).send({message: ' The car with the giving id was not found'});
    // save the new exam
    let exam = new Exam({
        client: _.pick(client, ['_id','name', 'surname', 'state', 'drivingLicenceType']),
        monitor:_.pick(monitor, ['_id','name', 'surname', 'certification']),
        car:_.pick(car, ['_id','num', 'mark', 'model']),
        numexam:req.body.numexam,
        examDate: req.body.examDate,
        agency: req.body.agency,
    });
    await exam.save();
    // send notif to client
    await newExamNotif(req, exam, exam.client._id);
    // send notif to monitor
    await newExamNotif(req, exam, exam.monitor._id);
    // send the response
    res.send(exam);
});
// Exam result success
router.patch('/succeed/:id', async (req, res) => {
    examDebug('debugging /exam endpoint');
    // validate the request schema
    const {error} = succeedExam(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify that the exam exist
    let exam = await Exam.findOne({_id: req.params.id, agency: req.user.agency});
    if (!exam) return res.status(404).send({message: ' The exam with the giving id was not found'});
    // verify if the state of the exam is REQUESTED
    examDebug('  Exam State: ', exam.state);
    if (exam.state !== examState[0]) return res.status(406).send({message: 'Only scheduled exam state'});
    // verify that the car exist
    // set the exam
    exam.examinateur = req.body.examinateur;
    exam.state = examState[1];
    // update the client sate to DRIVING
    const client = await Client.findOne({_id: exam.client._id});
    client.state = clientState[4];
    await client.save();
    await exam.save();
    res.send(exam);
});
// Exam result failed
router.patch('/failed/:id', async (req, res) => {
    examDebug('debugging /exam endpoint');
    // validate the request schema
    const {error} = failedExam(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify that the exam exist
    let exam = await Exam.findOne({_id: req.params.id, agency: req.user.agency});
    if (!exam) return res.status(404).send({message: ' The exam with the giving id was not found'});
    // verify if the state of the exam is REQUESTED
    if (exam.state !== examState[0]) return res.status(406).send({message: 'Only scheduled exam state'});
    // set the exam
    exam.examinateur = req.body.examinateur;
    exam.state = examState[2];
    await exam.save();
    res.send(exam);
});
// reset Exam state
router.patch('/reset/:id', async (req, res) => {
    examDebug('debugging /exam endpoint');
    // verify that the exam exist
    let exam = await Exam.findOne({_id: req.params.id, agency: req.user.agency});
    if (!exam) return res.status(404).send({message: ' The exam with the giving id was not found'});
    // verify if the state of the exam is scheduled
    if (exam.state === examState[0]) return res.status(406).send({message: 'Only  exam state for rest'});
    // save the exam
    exam.state = examState[0];
    exam.examinateur = '';
    await exam.save();
    res.send(exam);
});
// UPDATE Exam
router.put('/:id', async (req, res) => {
    // validate the request schema
    const {error} = validateUpdate(req.body, false);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});
    // verify that the client exist
    const client = await Client.findOne({_id: req.body.clientId});
    if (!client) return res.status(404).send({message: ' The Client with the giving id was not found'});
    // verify that the car exist
    const car = await Car.findOne({_id: req.body.carId});
    if (!car) return res.status(404).send({message: ' The car with the giving id was not found'});
    // verify that the moniteur exist
    const monitor = await Monitor.findOne({_id: req.body.monitorId});
    if (!monitor) return res.status(404).send({message: ' The monitor with the giving id was not found'});
    // update the exam with the giving id
    const exam = await Exam.findOneAndUpdate({_id: req.params.id, agency: req.body.agency}, req.body, {new: true});
    // if the exam wan not found return an error
    if (!exam) return res.status(404).send({message: ' The exam with the giving id was not found'});
    res.send(exam); //TODO add the logic of exam notif here same as in exam
});
// Delete Exam
router.delete('/:id', async  (req, res) => {
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});
    // delete the exam with the giving id
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, agency: req.user.agency});
    if (!exam) return res.status(404).send({ message: ' The exam with the giving id was not found'});
    return res.send(exam);
});
module.exports = router;


