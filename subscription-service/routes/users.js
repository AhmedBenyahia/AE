const {User, validateInfo, validatePassword} = require('../model/user');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const authorization = require('../middleware/authorization');
const bcrypt = require("bcrypt");
const multer = require('multer');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink)
// GET BY ID
router.get('/:id',[authorization,validateObjectId],async (req, res) => {
    let user = await User.findOne({_id: req.params.id});
    if (!user) return res.status(404).send({message: ' The user with the giving id was not found'});
    res.send(user);
});
router.put('/:id', [authorization,validateObjectId],async (req, res) => {
    const {error} = validateInfo(req.body);
    if (error) return res.status(400).send({
        message: error.details[0].message
    });
    let user = await User.findOne({_id: req.params.id});
    if(user){
        const existWithUserEmail=await User.findOne({'email':req.body.email});
        if( existWithUserEmail!==null && !user._id.equals(existWithUserEmail._id))
            return res.status(409).send("Other user already has this email");
    }
    user = await User.findOneAndUpdate({ _id: req.params.id}, req.body, { new: true});
    if (!user) return res.status(404).send({message: ' The user with the giving id was not found'});
    await user.save();

    res.send(user);
});

router.put('/password/:id', [authorization,validateObjectId],async (req, res) => {
    const {error} = validatePassword(req.body);
    if (error) return res.status(400).send({
        message: error.details[0].message
    });
    let user = await User.findOne({_id: req.params.id});
    if (!user) return res.status(404).send({message: ' The user with the giving id was not found'});
    const salt = await bcrypt.genSalt(10);
    const oldPassword = await bcrypt.hash(req.body.oldPassword, salt);
    const newPassword = await bcrypt.hash(req.body.newPassword, salt);
    let check= await bcrypt.compare(req.body.oldPassword,user.password);
    if(check===false) return res.status(400).send({message: "The old password is incorrect"});

    user = await User.findOneAndUpdate({ _id: req.params.id}, {password:newPassword}, { new: true});
    res.send(user);
});


router.put('/updateAvatar/:id',[authorization,validateObjectId],async (req, res) => {

    let user = await User.findOne({_id: req.params.id});
    if (!user) return res.status(404).send({message: ' The user with the giving id was not found'});
    let fileName=null;
    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/storage/avatars')
        },
        filename: function (req, file, cb) {
            fileName=Date.now() + '-' +file.originalname;
            cb(null, fileName )
        }
    })
    let upload = multer({ storage: storage }).single('file')

    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).send({message: err.message});
        } else if (err) {
            return res.status(400).send({message: err.message})
        }
        if(user.avatar){
            try {
                await unlinkAsync("public/storage/avatars/"+user.avatar);
            } catch (e) {

            }
        }
        user = await User.findOneAndUpdate({ _id: req.params.id}, {avatar:fileName}, { new: true});
        res.send(user);

    })



});

module.exports = router;
