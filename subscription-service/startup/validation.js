const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const joiExtended = Joi.extend({
    type: 'string',
    base: Joi.string(),
    messages: {
        "string.mobile": 'needs to be a valid phone number according to E.164 international format',
        "string.email": 'needs to be a valid emailAdr format',
        "string.objectId": 'needs to be a valid ID',
        "string.cinnn": 'needs to be a valid cin number',
        "string.numPlate": 'need to be a valid tunisienne car serial number'

    },
    rules: {
        phone: {
            validate(value, helpers, args, options) {
                const reg = RegExp(/^\+?[1-9]\d{1,14}$/);
                if (!reg.test(value)) {
                    return helpers.error('string.mobile', {v: value}, args, options);
                }
                return value
            }
        },
        emailAdr: {
            validate(value, helpers, args, options) {
                const reg = RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/);
                if (!reg.test(value)) {
                    return helpers.error('string.email', {v: value}, args, options);
                }
                return value;
            }
        },
        objectId: {
            validate(value, helpers, args, options) {
                const reg = RegExp(/^[0-9a-fA-F]{24}$/);
                if (!reg.test(value)) {
                    return helpers.error('string.objectId', {v: value}, args, options);
                }
                return value;
            }
        },
        cin: {
            validate(value, helpers) {
                const reg = RegExp(/^[0-9]{8}$/);
                if (!reg.test(value)) {
                    return helpers.error('string.cinnn');
                }
                return value
            }
        },
        numPlate: {
            validate(value, helpers, args, options) {
                const reg = RegExp(/^([0-9]{3}TN[0-9]{1,4})|(RT[0-9]{6})$/);
                if (!reg.test(value)) {
                    return helpers.error('string.numPlate', {v: value}, args, options);
                }
                return value
            }
        }
    }
});

module.exports = joiExtended;
