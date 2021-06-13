const mongoose = require('mongoose');
const {logger} = require('../startup/logging');
module.exports = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.agency)) {
        logger.info(` Invalid id ${req.params.agency}`);
        return res.status(404).send({message:'Invalid agency'});
    }
    return next();
};
