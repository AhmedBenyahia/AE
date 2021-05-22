const debug = require('debug')('subscription-service:authorization');
const request = require('request');

const publicRoutes = [{method: 'GET, POST', url: 'test/**'}]

module.exports = async function (req, res, next) {
    if (isPublicRoutes(req.method, req.url)) next()
    debug('Validation JWT')
    request.get('http://localhost:8080/auth-service/verify', {
        headers: {'authorization': req.header('authorization')},
        json: true
    }, (error, response, body) => {
        if (error || response.statusCode !== 200) {
            debug(error);
            return next() //TODO: Fix the isssue related to the proxy and remove this line
            // return res.status(401).send('Full authentication is required');
        }
        req.token = body
        next()
    });
};

function isPublicRoutes(method, url) {
    return publicRoutes.filter(c => (c.method.includes(method) || c.method === '*') && url.includes(c.url.split('**')[0])).length;
}
