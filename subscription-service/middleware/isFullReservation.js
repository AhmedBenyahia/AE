module.exports = function (req, res, next) {
    req.body.isFullReservation = req.user.role.toLowerCase().indexOf('client') <= -1;
    next();
};
