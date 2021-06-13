
module.exports =async function (req, res, next) {
        if(req.user.role!=="ADMIN") return res.status(401).send({message: 'Access denied'});
        next()
};
