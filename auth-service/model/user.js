const mongoose = require('mongoose');
const Joi = require('joi');
const JoiExtended = require('../startup/validation');

// fullName:required,email:required, password,phone,isConfirmed,isActive,role,avatar

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
    isConfirmed: {type: Boolean,},
    isActive: {type: Boolean,},
    role: {type: String},
    avatar: {type: String},
    agency: mongoose.Types.ObjectId,
});

// client account verification  token schema
const verificationTokenSchema = new mongoose.Schema({
    _userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 3600,
    }
});

// compile the model
const VerificationToken = mongoose.model('Token', verificationTokenSchema);

function validateSchema(car) {
    const schema = JoiExtended.object({
        email: JoiExtended.string().email().required(),
        fullName: JoiExtended.string().min(2).max(15).required(),
        password: JoiExtended.string().min(1).max(25),
        phone: JoiExtended.string().phone().required(),
        isConfirmed: JoiExtended.bool(),
        isActive:  JoiExtended.bool(),
        role: JoiExtended.string().required(),
        avatar: JoiExtended.string().max(255),
        agency: JoiExtended.string().objectId()
    });
    return schema.validate(car);
}

const User = mongoose.model('User', userSchema);

exports.userSchema = userSchema;
exports.VerificationToken = VerificationToken;
exports.User = User;
exports.validate = validateSchema;
