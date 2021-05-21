const mongoose = require('mongoose');
const Joi = require('joi');
const JoiExtended = require('../startup/validation');

const userSchema = new mongoose.Schema({
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
    phone: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 13,
        trim: true,
    },
    isConfirmed: {type: Boolean,},
    isActive: {type: Boolean,},
    role: {type: String},
    avatar: {type: String}
});

function validateSchema(car) {
    const schema = JoiExtended.object({
        name: JoiExtended.string().min(3).required(),
        surname: JoiExtended.string().min(3).required(),
        username: JoiExtended.string().min(2).max(15).required(),
        password: JoiExtended.string().min(1).max(25).required(),
        phone: JoiExtended.phone().required(),
        isConfirmed: JoiExtended.bool().required(),
        isActive:  JoiExtended.bool().required(),
        role: JoiExtended.string().required(),
        avatar: JoiExtended.string().max(255),
    });
    return schema.validate(car);
}

const User = mongoose.model('User', userSchema);

exports.userSchema = userSchema;
exports.User = User;
exports.validate = validateSchema;
