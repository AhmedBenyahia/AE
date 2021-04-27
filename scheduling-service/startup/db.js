const mongoose = require('mongoose');
const {logger} = require('../startup/logging');
const config = require('config');
module.exports = () => {
// const dbDebug = require('debug')('app:db');
    // connect to database
    mongoose.connect(config.get('db'), {
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: false
    })
        .then(() => logger.info( `connection to db: ${config.get('db')} succeeded`));
};
