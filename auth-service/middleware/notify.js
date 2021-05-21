const notifyDebug = require('debug')('app:notify');
// const {Notif} = require('../model/notif');

// socket server config, manage user connections
module.exports.connect = (io) => {
    // array to save connected user info
    io.connectedUser = [];
    // on user connection
    io.on('connection', function (socket) {

        notifyDebug("Socket established with id: " + socket.id);
        // notifyDebug("Connected User: ", io.connectedUser.length, ":");
        // io.connectedUser.forEach((c) => {
        //     notifyDebug("   Role: ", c.role, "SocketId:",c.socketId);
        // });
        // emit a connection event to client
        socket.emit('connection', 'connected');
        // say hello to our new client
        socket.emit('ping', {greeting: "hello world"});
        // catch the user connection event and save user info
        socket.on('save-user', function (data) {
            notifyDebug("User (" + data.role + ")connection channel saved: " + socket.id);
            notifyDebug("joining user to channel: " + data.role + "Channel#" + data.agency.slice(-4));
            // make sure the user is not already registered (not connected twice)
            if (!io.connectedUser.find(c => c.socketId === socket.id)) {
                // if not save the socketId and user data
                data.socketId = socket.id;
                io.connectedUser.push(data); //TODO add jwt validation
                // notifyDebug('socket.client obj: ', io.connectedUser[data._id]);
            }
            // join the user to group channel based on his role and agency
            if (data.role) {
                socket.join(data.role + 'Channel#' + data.agency.slice(-4));
            }
            //TODO: change this with connected user list
            notifyDebug("Connected User: ", io.connectedUser.length, ":");
            socket.to('adminChannel#' + data.agency.slice(-4))
                .emit('news', 'New player has joined the game');
        });
        // on user disconnection
        socket.on('disconnect', function () {
            notifyDebug("Socket disconnected: " + socket.id);
            // delete user form connectedUser array
            io.connectedUser = io.connectedUser.filter(c => c.socketId !== socket.id);
            notifyDebug("Connected User: ", io.connectedUser.length, ":");
        });
    })
};

/** Notif from client/monitor --> admin/manager  **/
// on client sign in
module.exports.newClientNotif = async (req, client) => {
    notifyDebug('newClientNotif');
    const notif = new Notif({
        subject: 'un nouveau client a inscrit dans votre agence',
        data: client._id,
        action: 'ClientRegistered',
        agency: req.body.agency,
    });
    await notif.save();
    req.app.io.to('adminChannel#' + req.body.agency.slice(-4))
        .emit('news', notif);
};
// on session request
module.exports.sessionReservationNotif = async (req, session) => {
    notifyDebug('sessionReservationNotif');
    notifyDebug('send to channel: ' + 'adminChannel#' + req.body.agency.slice(-4));
    const notif = new Notif({
        subject: 'une nouvelle demande de réservation a été ajouter par ' +
            ((!req.body.isFullReservation) ? 'un client' : 'un moniteur'),
        action: 'RequestSession',
        data: session._id,
        agency: req.user.agency,
    });
    await notif.save();
    req.app.io.to('adminChannel#' + req.body.agency.slice(-4))
        .emit('news', notif);
};
// on session cancel (and not reject)
module.exports.adminSessionCancelingNotif = async (req, session) => {
    notifyDebug('adminSessionCancelingNotif');
    // build notif body
    const notif = new Notif({
        subject: (req.user.role === 'client') ?
            'un client a annuler l\'une de c\'est session' :
            'un monitor a annuler une session',
        action: 'CancelSession',
        data: session._id,
        agency: req.user.agency,
    });
    // save notif in db
    await notif.save();
    // emit notif to admin
    req.app.io.to('adminChannel#' + req.body.agency.slice(-4))
        .emit('news', notif);
};
// on new car breakdown
module.exports.carBreakdownNotif = async (req, breakdown) => {
    notifyDebug('carBreakdownNotif');
    // build notif body
    const notif = new Notif({
        subject: 'Le monitor' + breakdown.monitor.name + ' ' +
            breakdown.monitor.surname + ' a declarer une panne de voiture'
            + breakdown.car.mark + breakdown.car.num,
        action: 'carBreakdown',
        data: breakdown._id,
        agency: req.user.agency,
    });
    // save notif in db
    await notif.save();
    // emit notif to admin
    req.app.io.to('adminChannel#' + req.body.agency.slice(-4))
        .emit('news', notif);
};
// on new monitor absence
module.exports.monitorAbsenceNotif = async (req, absence) => {
    notifyDebug('monitorAbsenceNotif');
    // build notif body
    const notif = new Notif({
        subject: 'Le monitor' + absence.monitor.name + ' ' +
            absence.monitor.surname + ' a declarer une absence de' +
            absence.debDate + 'a' + absence.endDate,
        data: absence._id,
        agency: req.user.agency,
    });
    // save notif in db
    await notif.save();
    // emit notif to admin
    req.app.io.to('adminChannel#' + req.body.agency.slice(-4))
        .emit('news', notif);
};

/** Notif from admin --> client/monitor  **/
// new session is added to user calendar (the calendar in the front)
module.exports.newSessionNotif = async (req, session, userId) => {
    notifyDebug('newSessionNotif');
    // send notification to user
    let notif = new Notif({
        subject: 'Vous avez une nouvelle session le' + session.reservationDate, //TODO format date
        action: 'NewSession',
        data: session._id,
        userId: userId,
        agency: req.user.agency,
    });
    //save notification in db
    await notif.save();
    // emit notif to the user if he is connected
    const userConnectionInfo = req.app.io.connectedUser
        .filter(c => c._id === userId.toString());
    if (userConnectionInfo[0]) {
        req.app.io.to(userConnectionInfo[0].socketId)
            .emit('news', notif);
    }

};
// session updated notif
module.exports.sessionDateUpdatedNotif = async (req, session, oldReservationDate, userId) => {
    notifyDebug('sessionDateUpdatedNotif');
    // send notification to monitor
    let notif = new Notif({
        subject: 'La date de session de' + oldReservationDate +
        ' a ete changer vers le ' + session.reservationDate, //TODO format date
        action: 'sessionReservationDateUpdated',
        data: session._id,
        userId: userId,
        agency: req.user.agency,
    });
    //save notification in db
    await notif.save();
    // emit notif to the user if he is connected
    const userConnectionInfo = req.app.io.connectedUser
        .filter(c => c._id === userId.toString());
    if (userConnectionInfo[0]) {
        req.app.io.to(userConnectionInfo[0].socketId)
            .emit('news', notif);
    }


};
// on session reject
module.exports.sessionRejectNotif = async (req, session) => {
    notifyDebug('sessionRejectNotif');
    // who post the reservation request
    const userId = (req.body.isFullReservation) ? session.monitor._id : session.client._id;
    // build the notification body
    const notif = new Notif({
        subject: 'Vous demande de reservation de session a ete rejecter par l\'admin, date session: ' +
            session.reservationDate,
        action: 'RejectSession',
        userId: userId,
        agency: req.user.agency,
    });
    // save the notification in db
    await notif.save();
    // send the notification to user
    const userConnectionInfo = req.app.io.connectedUser
        .filter(c => c._id === userId.toString());
    if (userConnectionInfo[0]) {
        req.app.io.to(userConnectionInfo[0].socketId)
            .emit('news', notif);
    }
};
// on session cancel (for monitor or client)
module.exports.usersSessionCancelingNotif = async (req, session, userId) => {
    notifyDebug('usersSessionCancelingNotif');
    // build notif body
    const notif = new Notif({
        subject: 'Le session de ' + session.reservationDate +
        ' a ete annuler',
        action: 'CancelSession',
        userId: userId,
        data: session._id,
        agency: req.user.agency,
    });
    // save notif in db
    await notif.save();
    // emit notif to user
    const userConnectionInfo = req.app.io.connectedUser
        .filter(c => c._id === userId.toString());
    if (userConnectionInfo[0]) {
        req.app.io.to(userConnectionInfo[0].socketId)
            .emit('news', notif);
    }
};
// on session car update
module.exports.sessionCarUpdatedNotif = async (req, session, userId) => {
    notifyDebug('sessionCarUpdatedNotif');
    // send notification to user
    let notif = new Notif({
        subject: 'la voiture de session de' + session.reservationDate +
        ' a ete changer', //TODO format date
        action: 'sessionCarUpdated',
        data: session._id,
        userId: userId,
        agency: req.user.agency,
    });
    //save notification in db
    await notif.save();
    // emit notif to the user if he is connected //TODO this is duplicated we can put it is FN
    const userConnectionInfo = req.app.io.connectedUser
        .filter(c => c._id === userId.toString());
    if (userConnectionInfo[0]) {
        req.app.io.to(userConnectionInfo[0].socketId)
            .emit('news', notif);
    }

};
// on new exam
module.exports.newExamNotif = async (req, exam, userId) => {
    notifyDebug('newExamNotif');
    // send notification to user
    let notif = new Notif({
        subject: 'Vous avez un nouveau exam le ' + exam.examDate, //TODO format date
        action: 'NewExam',
        data: exam._id,
        userId: userId,
        agency: req.user.agency,
    });
    //save notification in db
    await notif.save();
    // emit notif to the user if he is connected
    const userConnectionInfo = req.app.io.connectedUser
        .filter(c => c._id === userId.toString());
    if (userConnectionInfo[0]) {
        req.app.io.to(userConnectionInfo[0].socketId)
            .emit('news', notif);
    }

};
// on exam date update
module.exports.examDateUpdatedNotif = async (req, exam, oldExamDate, userId) => {
    notifyDebug('examDateUpdatedNotif');
    // send notification to monitor
    let notif = new Notif({
        subject: 'La date de exam de' + oldExamDate +
            ' a ete changer vers le ' + exam.examDate, //TODO format date
        action: 'examReservationDateUpdated',
        data: exam._id,
        userId: userId,
        agency: req.user.agency,
    });
    //save notification in db
    await notif.save();
    // emit notif to the user if he is connected
    const userConnectionInfo = req.app.io.connectedUser
        .filter(c => c._id === userId.toString());
    if (userConnectionInfo) {
        req.app.io.to(userConnectionInfo[0].socketId)
            .emit('news', notif);
    }


};
// on exam car update
module.exports.examCarUpdatedNotif = async (req, exam, userId) => {
    notifyDebug('examCarUpdatedNotif');
    // send notification to user
    let notif = new Notif({
        subject: 'la voiture de l\'exam de' + exam.examDate +
            ' a ete changer', //TODO format date
        action: 'examCarUpdated',
        data: exam._id,
        userId: userId,
        agency: req.user.agency,
    });
    //save notification in db
    await notif.save();
    // emit notif to the user if he is connected //TODO this is duplicated we can put it is FN
    const userConnectionInfo = req.app.io.connectedUser
        .filter(c => c._id === userId.toString());
    if (userConnectionInfo) {
        req.app.io.to(userConnectionInfo[0].socketId)
            .emit('news', notif);
    }

};
// on exam cancel
module.exports.examCancelingNotif = async (req, exam, userId) => {
    notifyDebug('examCancelingNotif');
    // build notif body
    const notif = new Notif({
        subject: 'L\' exam de ' + exam.examDate + ' a ete annuler',
        action: 'CancelExam',
        userId: userId,
        data: exam._id,
        agency: req.user.agency,
    });
    // save notif in db
    await notif.save();
    // emit notif to user
    const userConnectionInfo = req.app.io.connectedUser
        .filter(c => c._id === userId.toString());
    if (userConnectionInfo[0]) {
        req.app.io.to(userConnectionInfo[0].socketId)
            .emit('news', notif);
    }
};
