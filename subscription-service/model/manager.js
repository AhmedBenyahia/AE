const mongoose = require('mongoose');
const Joi = require('joi');
const JoiExtended = require('../startup/validation');
const managerSchema = new mongoose.Schema({
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
    email : {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxlength: 255,
        minlength: 5,
    },
    role: {
        type: String,
        required: true,
    },
    agency: mongoose.Types.ObjectId,
});

const Manager = mongoose.model('Managers', managerSchema);

function validateSchema(manager, newManager) {
    const schema = Joi.object().keys({
        password: Joi.string().min(8).max(255)
        .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required(),
                otherwise: Joi.forbidden()}),
        email: JoiExtended.string().email()
        .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()}),
        role: Joi.string()
        .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()}), //TODO add manager role enum
        agency: JoiExtended.string().objectId().required(),
    });
    return Joi.validate(manager, schema, {context: { condition: newManager}});
}

exports.managerSchema = managerSchema;
exports.Manager = Manager;
exports.validate = validateSchema;
