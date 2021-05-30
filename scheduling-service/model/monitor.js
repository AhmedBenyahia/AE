const mongoose = require('mongoose');
const Joi = require('joi');
const JoiExtended = require('../startup/validation');

const monitorState = ['ACTIVE','ABSENT', 'SUSPENDED', 'RETIRED'];

const monitorSchema = new mongoose.Schema({
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
     birthday: {
        type: Date,
        required: true,
    },
     cin: {
      type: String,
      minlength: 8,
      maxlength: 8,
      trim: true,
      required: true,
      unique: true,
    },
     cinDate: {
        type: Date,
        required: true,
    },
     username: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 55,
        unique: true
    },
     password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 255,
    },
     address: {
        type: String,
        maxLength: 255,
        trim: true,
    },
     phone: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 13,
        trim: true,
    },
     postalCode: {
        type: String,
        minLength: 4,
        maxLength: 10,
    },
     drivingLicence: {
        type: [new mongoose.Schema({
            drivingLicenceType: {
                type: String, // TODO: add enum att
                minLength: 1,
                maxLength: 6,
                trim: true,
                required: true,
            },
            drivingLicenceNum: {
                type: String,
                minLength: 8,
                maxLength: 8,
                // trim: true,
                // required: true,
            },
            drivingLicenceDate: {
                type: Date,
                required: true,
            },
        })]
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
     state: {
        type: String,
        trim: true,
        enum: monitorState,
        default: monitorState[0],
    },
    agency: mongoose.Types.ObjectId,
});

const Monitor = mongoose.model('Monitor', monitorSchema);

function validateSchema(monitor, newMonitor) {
    const schema = Joi.object().keys({
        name: Joi.string().min(4).max(55)
        .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()}),
        surname: Joi.string().min(4).max(55)
        .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()}),
        username: Joi.string().min(4).max(55)
            .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.forbidden()
            }),
        birthday: Joi.date()
        .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()}),
        cin: JoiExtended.string().cin()
        .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()}),
        cinDate: Joi.date()
        .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()}),
        drivingLicence: Joi.array().items({
            drivingLicenceType: Joi.string().required(),
            drivingLicenceDate: Joi.date().required(),
            drivingLicenceNum: Joi.string().min(8).max(8).required(),
        }),
        //.min(1)
        address: Joi.string().max(255).min(5),
        phone: JoiExtended.string().phone()
        .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()}),
        postalCode: Joi.string().min(4).max(10),
        certification: Joi.array().items({
            certificationType: Joi.string().required(),
            certificationDate: Joi.date().required(),
            certificationNum: Joi.string().min(8).max(8).required(),
        }),
       /*
        .min(1)
        .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()}),*/ // TODO: add joi validation for monitor certification  type with enum
        agency: JoiExtended.string().objectId().required(),

});
    return schema.validate(monitor, {context: {condition: newMonitor}});
}

exports.monitorSchema = monitorSchema;
exports.Monitor = Monitor;
exports.validate = validateSchema;
exports.monitorState = monitorState;
