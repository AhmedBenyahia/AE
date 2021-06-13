const mongoose = require('mongoose');
const JoiExtended = require('../startup/validation');
const jwt = require('jsonwebtoken');
const config = require('config');

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
        required: false,
        minlength: 8,
        maxlength: 255,
    },
    phone: {
        type: String,
        required: false,
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

// user schema validation
function validateSchema(user) {
    const schema = JoiExtended.object({
        email: JoiExtended.string().emailAdr().required(),
        fullName: JoiExtended.string().min(4).max(30).required(),
        password: JoiExtended.string().min(7).max(20),
        phone: JoiExtended.string().phone().required(),
        /*
        isActive:  JoiExtended.bool(),
        role: JoiExtended.string().required(),
        avatar: JoiExtended.string().max(255),
        agency: JoiExtended.string().objectId()*/
    });
    return schema.validate(user);
}

function validateLogin(req) {
    const schema = JoiExtended.object({
        email: JoiExtended.string().emailAdr().required(),
        password: JoiExtended.string().min(7).max(20),
    });
    return schema.validate(req);
}

function generateAuthToken(user) {
    return jwt.sign({
            _id: user._id,
            email: user.email,
            role: user.role,
            agency: user.agency,
        }, config.get('jwtPrivateKey')
    );
}

const User = mongoose.model('User', userSchema);

exports.userSchema = userSchema;
exports.VerificationToken = VerificationToken;
exports.User = User;
exports.validate = validateSchema;
exports.validateLogin = validateLogin;
exports.generateAuthToken = generateAuthToken;
exports.rolesEnum=roles;
