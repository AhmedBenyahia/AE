const mongoose = require('mongoose');
const Joi = require('joi');

const JoiExtended = require('../startup/validation');
// User schema
const roles = ['ADMIN', 'USER', 'CLIENT', 'SUDO', 'MONITOR']

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        minLength: 4,
        maxLength: 55,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 55,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 255,
    },
    phone: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 13,
        trim: true,
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        trim: true,
        enum: roles,
        required: true
    },
    avatar: {type: String},
    agency: {type:mongoose.Types.ObjectId,ref:'Agency'},
});
// compile the model
const User = mongoose.model('Users', userSchema);

// user schema validation
function validateSchema(user,newUser) {
    const schema = JoiExtended.object({
        email: JoiExtended.string().emailAdr().required(),
        fullName: JoiExtended.string().min(4).max(30).required(),
        password: Joi.string().min(7).max(20)
            .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required(),
                otherwise: Joi.forbidden()
            }),
        phone: JoiExtended.string().phone().required(),
        /*
        isActive:  JoiExtended.bool(),
        role: JoiExtended.string().required(),
        avatar: JoiExtended.string().max(255),*/
        agency: JoiExtended.string().objectId().required(),
    });
    return schema.validate(user,{context: {condition: newUser}});
}
function validatePasswordSchema(user) {
    const schema = Joi.object({
        oldPassword: Joi.string().min(8).max(255).required(),
        newPassword: Joi.string().min(8).max(255).required(),
        confirmPassword: Joi.any().equal(Joi.ref('newPassword'))
            .required()
            .label('Confirm password')
            .messages({ 'any.only': '{{#label}} does not match to the new password' })
    });
    return schema.validate(user);
}
function validateInfoSchema(user) {
    const schema = Joi.object({
        fullName: Joi.string().min(4).max(55).required(),
        phone: JoiExtended.string().phone().required(),
        email: JoiExtended.string().email().required(),
    });
    return schema.validate(user);
}

exports.User = User;
exports.validateInfo = validateInfoSchema;
exports.validatePassword = validatePasswordSchema;
exports.validateUser=validateSchema;
exports.rolesEnum=roles;
