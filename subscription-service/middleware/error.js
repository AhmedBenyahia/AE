const {logger} = require('../startup/logging');
module.exports = (err, req, res, next) => {
    //Log Error
    logger.log({
        level: 'error',
        message: 'Something failed:  ' + err.message,
        stack: err.stack
    });
    return res.status(500).send('Something failed')
};
