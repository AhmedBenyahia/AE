const {Client, clientState} = require('../model/client');

module.exports = async function (req, res, next) {
    const client = await Client.findOne({_id: req.params.id, agency: req.body.agency});
    if (!client) return res.status(404).send(' The client with the giving id was not found');
    if (client.state === clientState[6])
        return res.status(423).send(' The client with the giving id was not found');
    next();
};
