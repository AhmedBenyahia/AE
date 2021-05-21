const mongoose = require('mongoose');
const Joi = require('joi');
const JoiExtended = require('../startup/validation');
const sessionSchemaDebug = require('debug')('app:sessionSchemaMiddleware');
const sessionState = ['REQUESTED', 'APPROVED', 'CANCELED', 'FINISHED'];
const DAY = 24*60*60*1000;
// create session schema
let sessionSchema = new mongoose.Schema({
    client: {
        type: new mongoose.Schema({
            _id: mongoose.Types.ObjectId,
            name: {
                type: String,
                required: true,
                minLength: 4,
                maxLength: 55,
                trim: true,
            },
            surname: {
                type: String,
                required: true,
                minLength: 4,
                maxLength: 55,
                trim: true,
            },
            state: {
                type: String, //TODO add enum for client state
                required: true,
                trim: true,
            },
            drivingLicence: {
                type: String, // TODO: add enum att and num licence if exist
                minLength: 1,
                maxLength: 6,
                trim: true,
                default: null,
            }
        }),
        required: true,
    },
    monitor: {
        type: new mongoose.Schema({
            _id: mongoose.Types.ObjectId,
            name: {
                type: String,
                required: true,
                minLength: 4,
                maxLength: 55,
                trim: true,
            },
            surname: {
                type: String,
                required: true,
                minLength: 4,
                maxLength: 55,
                trim: true,
            },
            cin: {
                type: String,
                minlength: 8,
                maxlength: 8,
                trim: true,
            },
            certification: {
                type: [new mongoose.Schema({
                    certificationType: {
                        type: String,
                        minLength: 1,
                        maxLength: 6,
                        trim: true,
                        required: true
                    },
                    certificationDate: {
                        type: Date,
                        required: true,
                    },
                    certificationNum: {
                        type: String,
                        minLength: 8,
                        maxLength: 8,
                        trim: true,
                        required: true
                    }
                })]
            },
        }),
    },
    car: {
        type: new mongoose.Schema({
            _id: mongoose.Types.ObjectId,
            num: {
                type: String,
                required: true,
                trim: true,
                length: 11,
            },
            mark: {
                type: String,
                required: true,
                trim: true,
                minLength: 3,
                maxLength: 15
            },
            model: {
                type: String,
                required: true,
                trim: true,
                minLength: 1,
                maxLength: 25

            },
        }),
    },
    reservationDate: {
        type: Date,
        required: true
    },
    state: {
        type: String, //TODO add enum for session state
        enum: sessionState,
        trim: true,
        default: sessionState[0],
    },
    isPayed: {
        type: Boolean,
        default: false,
    },
    agency: mongoose.Types.ObjectId,
});
// def post middleware to update the session state is it's finished
sessionSchema.post('find', function (result) {
    sessionSchemaDebug('Session State checked!!');
    result.forEach((res) => {
        if (res.state === sessionState[1]
            && Date.now() >= res.reservationDate) {
            sessionSchemaDebug('res');
            res.state = sessionState[3];
            res.save();
            sessionSchemaDebug('SessionState updated!!');
        }
    })
});

sessionSchema.post('findOne', function (res) {
    sessionSchemaDebug('Session State checked!!');
    if (res.state === sessionState[1]
        && Date.now() >= res.reservationDate) {
        sessionSchemaDebug('res');
        res.state = sessionState[3];
        res.save();
        sessionSchemaDebug('SessionState updated!!');
    }
});

const Session = mongoose.model('Session', sessionSchema);

function validateReservationSchema(session) {
    const schema = Joi.object().keys({
        clientId: JoiExtended.string().objectId().required(),
        reservationDate: Joi.date().iso().min(Date.now()).min(Date.now() + DAY).required(),
        carId: JoiExtended.string().objectId().when('isFullReservation', {
            is: Joi.boolean().valid(true),
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }),
        monitorId: JoiExtended.string().objectId().when('isFullReservation', {
            is: Joi.boolean().valid(true),
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }),
        isFullReservation: Joi.boolean().required(),
        agency: JoiExtended.string().objectId().required(),
    });
    return schema.validate(session);
}

function validateApproveSchema(session) {
    const schema = {
        carId: JoiExtended.string().objectId().required(),
        monitorId: JoiExtended.string().objectId().required(),
        agency: JoiExtended.string().objectId().required(),
    };
    return schema.validate(session);
}

function validateUpdateSchema(session) {
    const schema = Joi.object({
        reservationDate: Joi.date().iso().min(Date.now()).max(Date.now() + DAY*30*6),
        carId: JoiExtended.string().objectId(),
        monitorId: JoiExtended.string().objectId(),
        agency: JoiExtended.string().objectId().required(),
    });
    return schema.validate(session);
}


exports.sessionSchema = sessionSchema;
exports.Session = Session;
exports.validateReservation = validateReservationSchema;
exports.validateApproving = validateApproveSchema;
exports.validateUpdating = validateUpdateSchema;
exports.sessionState = sessionState;
