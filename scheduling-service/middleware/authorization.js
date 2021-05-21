const debug = require('debug')('scheduling-service:authorization');
const request = require('request');


module.exports = function (req, res, next) {
    debug('Checking authorization')
    request('http://localhost:8080/auth-service/verify', {json: true}, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        console.log(body);
        console.log(body);
    });
    next()
    // return res.status(403).send('Access denied. You don\'t have the right permission')
    // return res.status(400).send(' Invalid token.');

};
