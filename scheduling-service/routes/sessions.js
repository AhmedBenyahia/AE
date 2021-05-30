const {Session, validateReservation, validateUpdating, sessionState} = require('../model/session');
const {Agency} = require('../model/agency');
const {Exam} = require('../model/exam');
const {Client} = require('../model/client');
const {Monitor} = require('../model/monitor');
const {Car} = require('../model/car');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const validateAgencyObjectId = require('../middleware/validateAgencyObjectId');
const authorization = require('../middleware/authorization');
const _ = require('lodash');
const sessionDebug = require('debug')('app:session');

sessionDebug('session debugging is enabled');

// GET ALL
router.get('/:agency',[authorization,validateAgencyObjectId], async (req, res) => {

    res.send(await Session.find({ agency: req.params.agency}).sort({startDate: -1}));
});



// GET ALL REQUESTED
router.get('/requested/:agency',[authorization,validateAgencyObjectId], async (req, res) => {

    res.send(await Session.find({ agency: req.params.agency,state:sessionState[0]}));
});

//GET BY DATE
router.get('/date/:agency/:startDate',[authorization,validateAgencyObjectId], async (req, res) => {
    //res.send(new Date(req.params.startDate))
    const start = new Date(req.params.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(req.params.startDate);
    end.setHours(23, 59, 59, 999);
    res.send(
        await Session.find(
            {
                agency: req.params.agency,
                startDate:{$gte:start,$lte:end},
                state:sessionState[0],
            }).sort({startDate: 1}))
});

// GET BY ID
router.get('/:id', [authorization,validateObjectId], async (req, res) => {
    const session = await Session.findOne({_id: req.params.id, agency: req.user.agency});
    if (!session) return res.status(404).send({message: ' The session with the giving id was not found'});
    res.send(session);
});


// GET Client Session
router.get('/client/:id', [authorization,validateObjectId],async (req, res) => {
    sessionDebug('debugging session/client/:id endpoint');
    res.send(await Session.find({ 'client._id': req.params.id}).sort({startDate: -1}));
});

// GET Monitor Session
router.get('/monitor/:id', [authorization,validateObjectId],async (req, res) => {
    res.send(await Session.find({ 'monitor._id': req.params.id}).sort({startDate: -1}));
});

// Request Appointment
router.post('/reserve', authorization,async (req, res) => {
    sessionDebug('debugging /reserve endpoint');
    // validate the request schema
    const {error} = validateReservation(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});
    // verify that the client exist
    const client = await Client.findOne({_id: req.body.client, agency: req.body.agency});
    if (!client) return res.status(404).send({message: ' The client with the giving id was not found'});
    // verify that the profile of the user is complete
    // if (client.state === clientState[1] || client.state === clientState[0])
    //     return res.status(423).send({message: 'Verify and Complete your profile before reserving sessions'});
    // verify that the client doesn't have a reservation in the same date and time

    let start=new Date(req.body.startDate);
    let end=new Date(req.body.endDate);
    if(start.getDay()!==end.getDay()) return res.status(400).send({message: "The start and end date should have the same day"})

    let session = await Session
        .find({
             startDate:{ $lte : req.body.startDate},
             endDate:{ $gte :req.body.startDate},
            'client._id': req.body.client,
             state: sessionState[0],
             agency:req.body.agency
        })
    let session2 = await Session
        .find({
            startDate:{ $gte : req.body.startDate},
            endDate:{ $lte :req.body.endDate},
            'client._id': req.body.client,
            state: sessionState[0],
            agency:req.body.agency
        })
    sessionDebug('Duplicated reservation with the same client and same date:', session.length !== 0);
    if (session.length!==0 || session2.length!==0) {
        return res.status(400).send({message: ' The giving client has already a session on the reservation date'});
    }

    const monitor = await Monitor.findOne({_id: req.body.monitor, agency: req.body.agency});
        if (!monitor) return res.status(404).send({message: ' The monitor with the giving id was not found'});
        // verify that the monitor is not reserved on the specified date
        let otherSession = await Session
            .find({
                startDate:{ $lte : req.body.startDate},
                endDate:{ $gte :req.body.startDate},
                'monitor._id': req.body.monitor,
                state: sessionState[0],
                agency:req.body.agency
            })
    let otherSession2 = await Session
        .find({
            startDate:{ $gte : req.body.startDate},
            endDate:{ $lte :req.body.endDate},
            'monitor._id': req.body.monitor,
            state: sessionState[0],
            agency:req.body.agency
        })
        sessionDebug('  Duplicated reservation with the same monitor and same date:',otherSession.length !== 0, " Nbre: ", otherSession.length);
        if (otherSession.length!==0 || otherSession2.length!==0) return res.status(400).send({message: 'The giving monitor is not available on the reservation date'});
    const car = await Car.findOne({_id: req.body.car, agency: req.body.agency});
        if (!car) return res.status(404).send({message: ' The car with the giving id was not found'});
        // verify that the car is not reserved on the specified date
          otherSession = await Session
            .find({
                startDate:{ $lte : req.body.startDate},
                endDate:{ $gte :req.body.startDate},
                state: sessionState[0],
                agency:req.body.agency,
                'car._id': car._id
            })
         otherSession2 = await Session
            .find({
                startDate:{ $lte : req.body.startDate},
                endDate:{ $gte :req.body.endDate},
                state: sessionState[0],
                agency:req.body.agency,
                'car._id': car._id
            })

        sessionDebug('  Duplicated reservation with the same car and same date:',
            otherSession.length !== 0, " Nbre: ", otherSession.length);
        if (otherSession.length!==0 || otherSession2.length!==0) return res.status(400).send({message: 'The giving car is not available on the reservation date'});
    // verify that he client doesn't have an exam on the reservation date
    const startDate=new Date(req.body.startDate).getDate();
    let exam = await Exam
        .find({
            examDate:startDate,
            'client._id': req.body.client, // safer than client: client
            agency:req.body.agency
        });
    sessionDebug('Exam in the same reservationDate and same client:', exam.length !== 0);
    if (exam.length !== 0) {
        return res.status(400).send({message: ' The giving client has an exam on the reservation date'});
    }
     exam = await Exam
        .find({
            examDate:startDate,
            'car._id': req.body.car, // safer than client: client
            agency:req.body.agency
        });
    sessionDebug('Exam in the same reservationDate and same car:', exam.length !== 0);
    if (exam.length !== 0) {
        return res.status(400).send({message: ' The giving car in exam on the reservation date'});
    }
    exam = await Exam
        .find({
            examDate:startDate,
            'monitor._id': req.body.monitor, // safer than client: client
            agency:req.body.agency
        });
    sessionDebug('Exam in the same reservationDate and same monitor:', exam.length !== 0);
    if (exam.length !== 0) {
        return res.status(400).send({message: ' The giving monitor has an exam on the reservation date'});
    }
    // add the client, reservation to the new session
    const mont={
        _id:monitor._id,
        name:monitor.name,
        surname:monitor.surname,
        certification:monitor.certification ? monitor.certification.certificationType:""
    };
    session = new Session({
        client: _.pick(client, ['_id','name', 'surname', 'state', 'drivingLicenceType']),
        monitor:mont,
        car:_.pick(car, ['_id','num', 'mark', 'model']),
        startDate: req.body.startDate,
        endDate:req.body.endDate,
        agency: req.body.agency,

    });
    // save the new session
    await session.save();
    // send the response
    res.send(session);
});



// REJECT Appointment
router.delete('/reject/:id', [authorization,validateObjectId], async (req, res) => {
    sessionDebug('Debugging /session/reject/:id');
    const session = await Session.findOne({ _id: req.params.id, agency: req.body.agency });
    // if the session was not found return an error
    if (!session) return res.status(404).send({message: ' The session with the giving id was not found'});
    // if the status of the session is REQUESTED
    await session.delete();
    return res.send(session);

});

// UPDATE Session: change monitor, car or date
// NOTE: the patch will not pass unless all the passed value are verified
// TODO: Refactor this method
router.patch('/update/:id', [authorization,validateObjectId], async (req, res) => {
    sessionDebug('debugging /reserve endpoint');
    // validate the request schema
    const {error} = validateUpdating(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // verify that the agency exist
    const agency = await Agency.findOne({_id: req.body.agency});
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});
    // verify that the client exist
    const client = await Client.findOne({_id: req.body.client, agency: req.body.agency});
    if (!client) return res.status(404).send({message: ' The client with the giving id was not found'});
    // verify that the profile of the user is complete
    // if (client.state === clientState[1] || client.state === clientState[0])
    //     return res.status(423).send({message: 'Verify and Complete your profile before reserving sessions'});
    // verify that the client doesn't have a reservation in the same date and time

    const verifiedSession = await Session.findOne({_id: req.params.id, agency: req.body.agency});
    // if the exam wan not found return an error
    if (!verifiedSession) return res.status(404).send({message: ' The session with the giving id was not found'});

    let start=new Date(req.body.startDate);
    let end=new Date(req.body.endDate);
    if(start.getDay()!==end.getDay()) return res.status(400).send({message: "The start and end date should have the same day"})

    let session = await Session
        .find({
            _id:{$ne:req.params.id},
            startDate:{ $lte : req.body.startDate},
            endDate:{ $gte :req.body.startDate},
            'client._id': req.body.client,
            state: sessionState[0],
            agency:req.body.agency
        })
    let session2 = await Session
        .find({
            _id:{$ne:req.params.id},
            startDate:{ $gte : req.body.startDate},
            endDate:{ $lte :req.body.endDate},
            'client._id': req.body.client,
            state: sessionState[0],
            agency:req.body.agency
        })
    sessionDebug('Duplicated reservation with the same client and same date:', session.length !== 0);
    if (session.length!==0 || session2.length!==0) {
        return res.status(400).send({message: ' The giving client has already a session on the reservation date'});
    }

    const monitor = await Monitor.findOne({_id: req.body.monitor, agency: req.body.agency});
    if (!monitor) return res.status(404).send({message: ' The monitor with the giving id was not found'});
    // verify that the monitor is not reserved on the specified date
    let otherSession = await Session
        .find({
            _id:{$ne:req.params.id},
            startDate:{ $lte : req.body.startDate},
            endDate:{ $gte :req.body.startDate},
            'monitor._id': req.body.monitor,
            state: sessionState[0],
            agency:req.body.agency
        })
    let otherSession2 = await Session
        .find({
            _id:{$ne:req.params.id},
            startDate:{ $gte : req.body.startDate},
            endDate:{ $lte :req.body.endDate},
            'monitor._id': req.body.monitor,
            state: sessionState[0],
            agency:req.body.agency
        })
    sessionDebug('  Duplicated reservation with the same monitor and same date:',otherSession.length !== 0, " Nbre: ", otherSession.length);
    if (otherSession.length!==0 || otherSession2.length!==0) return res.status(400).send({message: 'The giving monitor is not available on the reservation date'});
    const car = await Car.findOne({_id: req.body.car, agency: req.body.agency});
    if (!car) return res.status(404).send({message: ' The car with the giving id was not found'});
    // verify that the car is not reserved on the specified date
    otherSession = await Session
        .find({
            _id:{$ne:req.params.id},
            startDate:{ $lte : req.body.startDate},
            endDate:{ $gte :req.body.startDate},
            state: sessionState[0],
            agency:req.body.agency,
            'car._id': car._id
        })
    otherSession2 = await Session
        .find({
            _id:{$ne:req.params.id},
            startDate:{ $lte : req.body.startDate},
            endDate:{ $gte :req.body.endDate},
            state: sessionState[0],
            agency:req.body.agency,
            'car._id': car._id
        })

    sessionDebug('  Duplicated reservation with the same car and same date:',
        otherSession.length !== 0, " Nbre: ", otherSession.length);
    if (otherSession.length!==0 || otherSession2.length!==0) return res.status(400).send({message: 'The giving car is not available on the reservation date'});
    // verify that he client doesn't have an exam on the reservation date
    const startDate=new Date(req.body.startDate).getDate();
    let exam = await Exam
        .find({
            examDate:startDate,
            'client._id': req.body.client, // safer than client: client
            agency:req.body.agency
        });
    sessionDebug('Exam in the same reservationDate and same client:', exam.length !== 0);
    if (exam.length !== 0) {
        return res.status(400).send({message: ' The giving client has an exam on the reservation date'});
    }
    exam = await Exam
        .find({
            examDate:startDate,
            'car._id': req.body.car, // safer than client: client
            agency:req.body.agency
        });
    sessionDebug('Exam in the same reservationDate and same car:', exam.length !== 0);
    if (exam.length !== 0) {
        return res.status(400).send({message: ' The giving car in exam on the reservation date'});
    }
    exam = await Exam
        .find({
            examDate:startDate,
            'monitor._id': req.body.monitor, // safer than client: client
            agency:req.body.agency
        });
    sessionDebug('Exam in the same reservationDate and same monitor:', exam.length !== 0);
    if (exam.length !== 0) {
        return res.status(400).send({message: ' The giving monitor has an exam on the reservation date'});
    }
    // add the client, reservation to the new session
    const mont={
        _id:monitor._id,
        name:monitor.name,
        surname:monitor.surname,
        certification:monitor.certification ? monitor.certification.certificationType:""
    };

        verifiedSession.client= _.pick(client, ['_id','name', 'surname', 'state', 'drivingLicenceType']);
        verifiedSession.monitor=mont;
        verifiedSession.car=_.pick(car, ['_id','num', 'mark', 'model']);
        verifiedSession.startDate= req.body.startDate;
        verifiedSession.endDate=req.body.endDate;
        verifiedSession.agency=req.body.agency;
    // save the new session
    await verifiedSession.save();
    // send the response
    res.send(verifiedSession);
});



// CANCEL Session
router.patch('/cancel/:id', [authorization,validateObjectId], async (req, res) => {
    // if the session wan not found return an error
    const session = await Session.findOne({_id: req.params.id, agency: req.body.agency});
    if (!session) return res.status(404).send({message: ' The session with the giving id was not found'});
    // if the status of the session is REQUESTED
    session.state=sessionState[1];
    await session.save();
    res.send(session);
})
router.patch('/finish/:id', [authorization,validateObjectId], async (req, res) => {
    // if the session wan not found return an error
    const session = await Session.findOne({_id: req.params.id, agency: req.body.agency});
    if (!session) return res.status(404).send({message: ' The session with the giving id was not found'});
    // if the status of the session is REQUESTED
    session.state=sessionState[2];
    await session.save();
    res.send(session);
})
router.patch('/paid/:id',[authorization,validateObjectId], async (req, res) => {
    // if the session wan not found return an error
    const session = await Session.findOne({_id: req.params.id, agency: req.body.agency});
    if (!session) return res.status(404).send({message: ' The session with the giving id was not found'});
    // if the status of the session is REQUESTED
    session.isPayed=true;
    await session.save();
    res.send(session);
})

// GET ALL CLIENT BY AGENCY
router.get('/clients/:agency', [authorization,validateAgencyObjectId],async (req, res) => {
    // The agency id should be fetch for the current log in user !!
    res.send(await Client.find({ agency: req.params.agency}));
});

module.exports = router;
