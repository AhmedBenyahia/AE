const express = require('express');
const logger = require('morgan');
const spawn = require('child_process').spawn;
const fs = require('fs');
const out = fs.openSync('./out.log', 'a');
const err = fs.openSync('./out.log', 'a');
const debug = require('debug')('proxy-service:server');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Run The proxy service java jar
debug("Starting discovery-service java app")
debug("See bin/out.log for debug information")
const child = spawn('java', ['-jar', 'proxy-service.jar'], {
    detached: false,
    stdio: [ 'ignore', out, err ]
});

child.unref();
module.exports = app;
