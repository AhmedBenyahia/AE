const mongoose = require('mongoose');
const Joi = require('joi');
const JoiExtended = require('../startup/validation');
const fs = require('fs');
const clientSchemaDebug = require('debug')('app:clientSchemaDebug');
const clientState = ['UNVERIFIED','PROFILE_NOT_COMPLETED','READY','LEARNING',
                     'DRIVING', 'INACTIVE', 'SUSPENDED', 'RETIRED'];
            //TODO: The client state should give you witch phase
           //TODO: the client has reach in his driving licence (code, conduite)
// Client schema
const clientSchema = new mongoose.Schema({
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
   name: {
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
   surname: {
       type: String,
       required: true,
       minLength: 4,
       maxLength: 55,
       trim: true,
   },
   address: {
       type: String,
       maxLength: 255,
       trim: true,
   },
   email : {
        type: String,
        required: true,
        trim: true,
        maxlength: 255,
        minlength: 5,
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
               default: null,
           },
           drivingLicenceNum: {
               type: String,
               minLength: 8,
               maxLength: 8,
               trim: true,
               default: null,
           },
           drivingLicenceDate: {
               type: Date,
               required: true,
           },
       })]
   },
   state: {
       type: String, //TODO add enum for client state
       trim: true,
       enum: clientState,
       default: clientState[0],
   },
   hasPack: {
       type: Boolean,
       default: false,
   },
   agency: mongoose.Types.ObjectId,
});

// def post middleware to update the client state if it completed
clientSchema.post('find', function (result) {
    clientSchemaDebug('Client State checked!!');
    result.forEach(async (res) => {
        if (res && res.state === clientState[1] &&
            checkFileExists('./upload/cin/' + res._id) &&
            checkFileExists('./upload/permi/' + res._id)) {
            res.state = clientState[2];
            await res.save();
            clientSchemaDebug('client state updated');
        }
    })
});
clientSchema.post('findOne', async function (res) {
    clientSchemaDebug('Client State checked!!!');
    if (res && res.state === clientState[1] &&
        await checkFileExists('./upload/cin/' + res.cin) &&
        await checkFileExists('./upload/permi/' + res.cin)) {
        res.state = clientState[2];
        await res.save();
        clientSchemaDebug('client state updated');
    }
});
// compile the model
const Client = mongoose.model('Clients', clientSchema);

// client account verification  token schema
const verificationTokenSchema = new mongoose.Schema({
    _clientId: {
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


function validateSchema(client, newClient) {
    const schema = Joi.object({
        username: Joi.string().min(4).max(55)
            .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()
            }),
        password: Joi.string().min(8).max(255)
            .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required(),
                otherwise: Joi.forbidden()
            }),
        name: Joi.string().min(4).max(55)
            .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()
            }),
        surname: Joi.string().min(4).max(55)
            .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()
            }),
        birthday: Joi.date()
            .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()
            }),
        cin: JoiExtended.string().cin()
            .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()
            }),
        cinDate: Joi.date()
            .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()
            }),
        phone: JoiExtended.string().phone()
            .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()
            }),
        email: JoiExtended.string().email()
            .when('$condition', {
                is: Joi.boolean().valid(true),
                then: Joi.required()
            }),
        agency: JoiExtended.string().objectId().required(),
        address: Joi.string().max(255).min(5),
        postalCode: Joi.string().min(4).max(10),
        // TODO: add joi validation for driving licence type with enum
        drivingLicence: Joi.array().items({
            drivingLicenceType: Joi.string().required(),
            drivingLicenceDate: Joi.date().required(),
            drivingLicenceNum: Joi.string().min(8).max(8).required(),
        })
    });
    return schema.validate(client, {context: {condition: newClient}});
}

function checkFileExists(filepath) {
    return new Promise((resolve, reject) => {
        fs.access(filepath, fs.F_OK, error => {
            resolve(!error);
        });
    });
}
exports.clientSchema = clientSchema;
exports.Client = Client;
exports.validate = validateSchema;
exports.clientState = clientState;
exports.VerificationToken = VerificationToken;
