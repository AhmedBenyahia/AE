const mongoose = require('mongoose');
const JoiExtended = require('../startup/validation');

const carState = ['ACTIVE', 'SUSPENDED', 'RETIRED'];

const carSchema = new mongoose.Schema({
    num: {
      type: String,
      required: true,
      trim: true,
      length: 9,
    },
    mark: {
      type: String,
      required: true,
      trim: true,
        minLength: 2,
      maxLength: 15
    },
    model: {
            type: String,
            required: true,
            trim: true,
            minLength: 1,
            maxLength: 25
    },
    serialNum: {
        type: String,
        required: true,
        trim: true,
        length: 17,
    },
    dateFirstRegistration: {
        type: Date,
        required: true,
    },
    exploitationCartDate: {
        type: Date,
        required: true,
    },
    exploitationCartNum: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20,
        minlength: 5,
    },
    state: {
        type: String,
        trim: true,
        enum: carState,
        default: carState[0],
    },
    agency: mongoose.Types.ObjectId,
});

const Car = mongoose.model('Cars', carSchema);

function validateSchema(car) {
    const schema = JoiExtended.object({
        num: JoiExtended.string().numPlate().required(),
        exploitationCartNum: JoiExtended.string().min(5).required(),
        exploitationCartDate: JoiExtended.date().required(),
        dateFirstRegistration: JoiExtended.date().required(),
        serialNum: JoiExtended.string().length(17).required(),
        mark: JoiExtended.string().min(2).max(15).required(),
        model: JoiExtended.string().min(1).max(25).required(),
        agency: JoiExtended.string().objectId().required()
    });
    return schema.validate(car);
}

exports.carSchema = carSchema;
exports.Car = Car;
exports.validate = validateSchema;
exports.carState = carState;
