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
const validateAgencyObjectId = require('../middleware/validateAgencyObjectId');
const authorization = require('../middleware/authorization');
const _ = require('lodash');
const examDebug = require('debug')('app:exam');
const DAY = 24*60*60*1000;
const {newExamNotif} = require('../middleware/notify');
// GET ALL
router.get('/:agency', [authorization,validateAgencyObjectId],async (req, res) => {
    res.send(await Exam.find({agency: req.params.agency}).sort({examDate: -1}));
});

// GET ALL SCHEDULED
router.get('/scheduled/:agency', [authorization,validateAgencyObjectId],async (req, res) => {

    res.send(await Exam.find({ agency: req.params.agency,state:examState[0]}));
});
//GET BY DATE
router.get('/date/:agency/:examDate', [authorization,validateAgencyObjectId],async (req, res) => {
    //res.send(new Date(req.params.startDate))
    const start = new Date(req.params.examDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(req.params.examDate);
    end.setHours(23, 59, 59, 999);
    res.send(
        await Exam.find(
            {
                agency: req.params.agency,
                examDate:{$gte:start,$lte:end},
                state:examState[0],
            }).sort({examDate: 1}))
});
// GET BY ID
    router.get('/:agency/:id',[authorization,validateAgencyObjectId,validateObjectId], async (req, res) => {
    const exam = await Exam.findOne({_id: req.params.id, agency: req.params.agency});
    if (!exam) return res.status(404).send({message: ' The exam with the giving id was not found'});
    res.send(exam);
});

// GET Client exam
// GET Monitor exam

// Add new Exam
router.post('/scheduled', authorization,async (req, res) => {
    examDebug('debugging /exam endpoint');
    // validate the request schema
    const {error} = validatesScheduled(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});

    const existCredentials=await Exam.findOne({numexam:req.body.numexam,agency:req.body.agency,});
    if(existCredentials!==null) return res.status(409).send("Exam number already exist")
    let exams=await Exam.find({
        examDate:{$eq:req.body.examDate},
        'client._id':req.body.client,
        agency:req.body.agency,
    });
    if(exams.length!==0) return res.status(400).send({message:"The giving client has already a exam on the reservation date"})
     exams=await Exam.find({
        examDate:{$eq:req.body.examDate},
        'monitor._id':req.body.monitor,
         agency:req.body.agency,
    });
    if(exams.length!==0)return res.status(400).send({message:"The giving monitor has already a exam on the reservation date"})
    exams=await Exam.find({
        examDate:{$eq:req.body.examDate},
        'car._id':req.body.car,
        agency:req.body.agency,
    });
    if(exams.length!==0)return res.status(400).send({message:"The giving car is not available on the reservation date"})
    exams=await Exam.find({
        examDate:{$eq:req.body.examDate},
        examinateur:req.body.examinateur,
        agency:req.body.agency,
    });
    if(exams.length!==0)return res.status(400).send({message:"The giving examiner is not available on the reservation date"})
    // verify that the client exist
    const client = await Client.findOne({_id: req.body.client, agency: req.body.agency});
    if (!client) return res.status(404).send({message: ' The client with the giving id was not found'});
    // verify that the client doesn't have a reservation in the same date and it's APPROVED
    const monitor = await Monitor.findOne({_id: req.body.monitor, agency: req.body.agency});
    if (!monitor) return res.status(404).send({message: ' The monitor with the giving id was not found'});
    // verify the car ..
     const car = await Car.findOne({_id: req.body.car, agency: req.body.agency});
    if (!car) return res.status(404).send({message: ' The car with the giving id was not found'});
    const mont={
        _id:monitor._id,
        name:monitor.name,
        surname:monitor.surname,
        certification:monitor.certification ? monitor.certification.certificationType:""
    };
    // save the new exam
    let exam = new Exam({
        client: _.pick(client, ['_id','name', 'surname', 'state', 'drivingLicenceType']),
        monitor:mont,
        car:_.pick(car, ['_id','num', 'mark', 'model']),
        numexam:req.body.numexam,
        examDate: req.body.examDate,
        agency: req.body.agency,
        examinateur:req.body.examinateur,
    });
    await exam.save();
    // send notif to client
    //await newExamNotif(req, exam, exam.client._id);
    // send notif to monitor
    //await newExamNotif(req, exam, exam.monitor._id);
    // send the response
    res.send(exam);
});
// Exam result success
router.patch('/succeed/:id', [authorization,validateObjectId],async (req, res) => {
    examDebug('debugging /exam endpoint');
    // validate the request schema
    const {error} = succeedExam(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify that the exam exist
    let exam = await Exam.findOne({_id: req.params.id, agency: req.body.agency});
    if (!exam) return res.status(404).send({message: ' The exam with the giving id was not found'});
    // verify if the state of the exam is REQUESTED
    examDebug('  Exam State: ', exam.state);
    //if (exam.state !== examState[0]) return res.status(406).send({message: 'Only scheduled exam state'});
    // verify that the car exist
    // set the exam
   // exam.examinateur = req.body.examinateur;
    exam.state = examState[1];
    // update the client sate to DRIVING
    const client = await Client.findOne({_id: exam.client._id});
    client.state = clientState[4];
    await client.save();
    await exam.save();
    res.send(exam);
});
// Exam result failed
router.patch('/failed/:id', [authorization,validateObjectId],async (req, res) => {
    examDebug('debugging /exam endpoint');
    // validate the request schema
    const {error} = failedExam(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify that the exam exist
    let exam = await Exam.findOne({_id: req.params.id, agency: req.body.agency});
    if (!exam) return res.status(404).send({message: ' The exam with the giving id was not found'});
    // verify if the state of the exam is REQUESTED
   // if (exam.state !== examState[0]) return res.status(406).send({message: 'Only scheduled exam state'});
    // set the exam
   //exam.examinateur = req.body.examinateur;
    exam.state = examState[2];
    await exam.save();
    res.send(exam);
});
// reset Exam state
router.patch('/reset/:id', [authorization,validateObjectId],async (req, res) => {
    examDebug('debugging /exam endpoint');
    // verify that the exam exist
    let exam = await Exam.findOne({_id: req.params.id, agency: req.body.agency});
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
router.put('/:id', [authorization,validateObjectId],async (req, res) => {
    // validate the request schema
    const {error} = validateUpdate(req.body, false);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});
    const ex=await Exam.findOne({_id:req.params.id});
    if(ex){
        const existCredentials=await Exam.findOne({numexam:req.body.numexam,agency:req.body.agency,});
        if(existCredentials && !ex._id.equals(existCredentials._id)) return res.status(409).send("Other exam already has this number")
    }
    let exams=await Exam.find({
        _id:{$ne:req.params.id},
        examDate:{$eq:req.body.examDate},
        'client._id':req.body.client,
        agency:req.body.agency,
    });
    if(exams.length!==0) return res.status(400).send({message:"The giving client has already a exam on the reservation date"})
    exams=await Exam.find({
        _id:{$ne:req.params.id},
        examDate:{$eq:req.body.examDate},
        'monitor._id':req.body.monitor,
        agency:req.body.agency,
    });
    if(exams.length!==0)return res.status(400).send({message:"The giving monitor has already a exam on the reservation date"})
    exams=await Exam.find({
        _id:{$ne:req.params.id},
        examDate:{$eq:req.body.examDate},
        'car._id':req.body.car,
        agency:req.body.agency,
    });
    if(exams.length!==0)return res.status(400).send({message:"The giving car is not available on the reservation date"})
    exams=await Exam.find({
        _id:{$ne:req.params.id},
        examDate:{$eq:req.body.examDate},
        examinateur:req.body.examinateur,
        agency:req.body.agency,
    });
    if(exams.length!==0)return res.status(400).send({message:"The giving examiner is not available on the reservation date"})
    // verify that the client exist
    const client = await Client.findOne({_id: req.body.client});
    if (!client) return res.status(404).send({message: ' The Client with the giving id was not found'});
    // verify that the car exist
    const car = await Car.findOne({_id: req.body.car});
    if (!car) return res.status(404).send({message: ' The car with the giving id was not found'});
    // verify that the moniteur exist
    const monitor = await Monitor.findOne({_id: req.body.monitor});
    if (!monitor) return res.status(404).send({message: ' The monitor with the giving id was not found'});
    // update the exam with the giving id

    const exam = await Exam.findOne({_id: req.params.id, agency: req.body.agency});
    // if the exam wan not found return an error
    if (!exam) return res.status(404).send({message: ' The exam with the giving id was not found'});
    const mont={
        _id:monitor._id,
        name:monitor.name,
        surname:monitor.surname,
        certification:monitor.certification ? monitor.certification.certificationType:""
    };
    exam.numexam=req.body.numexam;
    exam.client=_.pick(client, ['_id','name', 'surname', 'state', 'drivingLicenceType']);
    exam.monitor=mont;
    exam.car=_.pick(car, ['_id','num', 'mark', 'model']);
    exam.examDate= req.body.examDate;
    exam.agency=req.body.agency;
    exam.examinateur=req.body.examinateur
    await exam.save();
    res.send(exam); //TODO add the logic of exam notif here same as in exam
});
// Delete Exam
router.delete('/:id', [authorization,validateObjectId],async  (req, res) => {
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});
    // delete the exam with the giving id
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, agency: req.body.agency});
    if (!exam) return res.status(404).send({ message: ' The exam with the giving id was not found'});
    return res.send(exam);
});

// GET ALL CLIENT BY AGENCY
router.get('/agency/clients/:agency', [authorization,validateAgencyObjectId],async (req, res) => {
    // The agency id should be fetch for the current log in user !!
    res.send(await Client.find({ agency: req.params.agency}));
});

module.exports = router;


