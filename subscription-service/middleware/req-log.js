const express = require('express');
const _ = require('lodash');
const router = express.Router();
const {logger} = require('../startup/logging');
const logDebug = require('debug')('app:log');


module.exports = router.use('*', (req, res, next) => {
    logDebug('Req info has been saved in log');
    logger.log({
            level: 'info',
            message: `method:${req.method}  url:${req.originalUrl}`,
            meta: _.pick(req, ['headers', 'originalUrl', 'body'])
        }
    );
    next();
});
