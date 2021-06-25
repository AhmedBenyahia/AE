const mongoose = require('mongoose');
const Joi = require('joi');
 const JoiExtended = require('../startup/validation');

const examState = ['scheduled', 'succeed', 'failed'];
const DAY = 24*60*60*1000;


const examSchema = new mongoose.Schema({
    numexam: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 18,
        unique: true
    },
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
            certification: {
                type: String, // TODO: add enum att to certification
                minLength: 1,
                maxLength: 6,
                trim: true,
                required: false,
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
                length: 17,
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
    state: {
        type: String, //TODO add enum for session state
        enum: examState,
        trim: true,
        default: examState[0],
    },
    examDate: {
        type: Date,
        required: true
    },
    examinateur:{
        type: String ,
        required:true
    },
    agency: mongoose.Types.ObjectId,
});
const Exam = mongoose.model('Exam', examSchema);

function validatesScheduled(exam) {
    const schema = Joi.object().keys({
        numexam: Joi.string().min(8).max(18).required(),
        client: JoiExtended.string().objectId().required(),
        car: JoiExtended.string().objectId().required(),
        agency: JoiExtended.string().objectId().required(),
        monitor: JoiExtended.string().objectId().required(),
        examDate: Joi.date().iso().min(Date.now()).min(Date.now()).required(),
        examinateur:Joi.string().required()
});
    return schema.validate(exam);
}

function succeedExam(exam) {
    const schema = Joi.object().keys({
        //examinateur: Joi.string().min(4).max(25).required(),
        agency: JoiExtended.string().objectId().required(),
    });
    return schema.validate(exam);
}

function failedExam(exam) {
    const schema = Joi.object().keys({
        //examinateur: Joi.string().min(4).max(25).required(),
        agency: JoiExtended.string().objectId().required(),    
    });
    return schema.validate(exam);

}

function validateUpdate(exam, newExam) {
    const schema = Joi.object().keys({
        numexam: Joi.string().min(8).max(18)
        .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()}),
        examDate: Joi.date().iso().min(Date.now()).min(Date.now()),
        car: JoiExtended.string().objectId(),
        client: JoiExtended.string().objectId(),
        agency: JoiExtended.string().objectId(),
        monitor: JoiExtended.string().objectId(),
        examinateur:Joi.string().required()
        
    });
    return schema.validate(exam, {context: {condition: newExam}});
}

exports.validateUpdate = validateUpdate;
exports.failedExam = failedExam;
exports.succeedExam = succeedExam;
exports.validatesScheduled = validatesScheduled;
exports.Exam = Exam;
exports.examSchema = examSchema;
exports.examState = examState;




