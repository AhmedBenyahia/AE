const mongoose = require('mongoose');
const Joi = require('joi');
const DAY = 24*60*60*1000;
const joiExtended = require('../startup/validation');


const agencySchema = new mongoose.Schema( {
    title: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 255,
        trim: true,
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
    email : {
        type: String,
        required: true,
        trim: true,
        unique: false,
        maxlength: 255,
        minlength: 5,
    },
    licenceExpirationDate: {
        type: Date,
        default: Date.now() + 365 * DAY,
    },
    state: {
        type: String, //TODO add enum for agency state
        trim: true,
        default: null,
    },
    logo: {
        type: String,
        minLength: 1,
        maxLength: 255
    },
    taxRegistrationNum: {
        type: String,
        minlength: 9,
        maxlength: 9,
        trim: true,
        required: true,
    },
    taxRegistrationDate: {
        type: Date,
        required: true,
    },
    cin: {
        type: String,
        minlength: 8,
        maxlength: 8,
        trim: true,
        required: true,
    },
    cinDate: {
        type: Date,
        required: true,
    },
    region: {
        type: String,
        required: true,
    }
});

const Agency = mongoose.model('Agency', agencySchema);

function validateSchema(agency) {
    const schema = Joi.object({
        title: Joi.string().min(4).max(55).required(),
        taxRegistrationNum: Joi.string().length(9).required(),
        cin: Joi.string().length(8).required(),
        address: Joi.string().max(255).min(5),
        phone: joiExtended.string().phone().min(8).max(13).required(), //TO DO add phone function
        postalCode: Joi.string().min(4).max(10),
        state: Joi.string(),
        email: joiExtended.string().emailAdr().required(),
        taxRegistrationDate: Joi.date().required(),
        cinDate: Joi.date().required(),
        region: Joi.string().required(),
    });
    return schema.validate(agency);
}
exports.validate = validateSchema;

exports.agencySchema = agencySchema;
exports.Agency = Agency;
