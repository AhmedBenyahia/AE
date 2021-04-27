const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const config = require('config');
require('winston-mongodb');
require('express-async-errors');


// create  custom logger
const myFormat = printf(({ level, message, label, timestamp, stack }) => {
    if (stack === undefined) stack = '';
    return `${timestamp} [${label}] ${level}: ${message} ${stack}`;
});

logger = createLogger({
    format: combine(
        label({label: Date.now()}),
        timestamp(),
        myFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logfile.log' }),
        new transports.MongoDB({ db: `${config.get('db')}`})
    ],
    exceptionHandlers: [
        new transports.File({ filename: 'exceptions.log' }),
        new transports.Console({format: myFormat}),
    ]
});

// export the logger to be used in other file
module.exports.logger = logger;

// we catching the unhandled rejection and transform it to exception
module.exports.handleRejection = function()  {
    process.on('unhandledRejection', (ex) => {
        throw(ex);
    });
};

