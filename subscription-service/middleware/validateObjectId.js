const mongoose = require('mongoose');
const {logger} = require('../startup/logging');
module.exports = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        logger.info(` Invalid id ${req.params.id}`);
        return res.status(404).send('Invalid Id');
    }
    return next();
};
