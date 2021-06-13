const express = require('express');
const router = express.Router();
const {Agency, validate} = require('../model/agency');
const _=require('lodash');
const {User,validateUser,rolesEnum} =require('../model/user');
const {Client} =require('../model/client');
const authorization = require('../middleware/authorization');
const adminAuthorization = require('../middleware/adminAuthorisation');
const validateObjectId = require('../middleware/validateObjectId');
const bcrypt = require('bcrypt');
const randomColor = require('randomcolor');

router.get('/agencies',[authorization,adminAuthorization] ,async (req, res) => {
    res.send(await Agency.find());
});

router.get('/agencies/:id',[authorization,adminAuthorization,validateObjectId],async (req,res)=>{
    try{
        let agency=await Agency.findById(req.params.id);
        if(!agency)
            return res.status(404).json('Agency not found');
        return res.status(200).json(agency);
    }catch (error){
        return res.status(400).send(error.message)
    }


});
router.put('/agencies/:id',[authorization,adminAuthorization,validateObjectId],async (req,res)=>{
    try{
        const {error} = validate(req.body);
        if (error) return res.status(400).send({message: error.details[0].message});

        let agency=await Agency.findById(req.params.id);
        if(!agency)
            return res.status(404).json('Agency not found');
        agency=_.merge(agency,req.body);
        agency=await agency.save();
        return res.status(200).json(agency);

    }catch(error){
        return res.status(400).send(error.message)
    }
})


router.post('/agencies', [authorization,adminAuthorization],async (req, res) => {
    // validate the request body
    const {error} = validate(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // create new agency instance
    const agency = new Agency(req.body);
    // save the new agency in the database
    await agency.save();
    res.send(agency);
});

// DELETE Agency
router.delete('/agencies/:id', [authorization,adminAuthorization,validateObjectId], async (req, res) => {
    const agency = await Agency.findOneAndDelete({ _id: req.params.id});
    // if the agency wan not found return an error
    if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});
    return res.send(agency);
});

router.get('/users',[authorization,adminAuthorization] ,async (req, res) => {
    res.send(await User.find({role:"USER"}).populate('agency'));
});


// ADD New User
router.post('/users', [authorization,adminAuthorization],async (req, res) => {
    try{
        // validate the request schema
        const {error} = validateUser(req.body,true);
        if (error) return res.status(400).send({message: error.details[0].message});

        const agency = await Agency.findOne({_id: req.body.agency});
        if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});
        // verify if the email already exist

        if (await User.findOne({email: req.body.email})) {
            return res.status(400).send({message: 'A user with the same email already exist !!'});
        }
        // save the new user
        let user = new User(_.omit(req.body, ['password']));
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.role=rolesEnum[1];
        user.isConfirmed=true;
        await user.save();
        res.send(user);
    }catch (err) {
        return res.status(400).send({message: err.message});
    }

});

router.put('/users/:id', [authorization,adminAuthorization,validateObjectId],async (req, res) => {
   try{
       // validate the request schema
       const {error} = validateUser(req.body,false);
       if (error) return res.status(400).send({message: error.details[0].message});
       const agency = await Agency.findOne({_id: req.body.agency});
       if (!agency) return res.status(404).send({message: ' The agency with the giving id was not found'});
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
   }catch (err) {
       return res.status(400).send({message: err.message});
   }

});

// DELETE User
router.delete('/users/:id', [authorization,adminAuthorization,validateObjectId], async (req, res) => {
    const user = await User.findOneAndDelete({ _id: req.params.id});
    // if the user wan not found return an error
    if (!user) return res.status(404).send({message: ' The user with the giving id was not found'});
    return res.send(user);
});

// suspend the account of a user
router.put('/users/suspended/:id', [authorization,adminAuthorization,validateObjectId], async (req, res) => {
    const user = await User.findOne({ _id: req.params.id});
    // if the user wan not found return an error
    if (!user) return res.status(404).send({message: ' The client with the giving id was not found'});
    user.isActive=false;
    await user.save();
    return res.send(user);
});

router.get('/statistics',[authorization,adminAuthorization],async (req,res)=>{
    try{
        const countOfUsers=await User.countDocuments();
        const countOfUsersActive=await User.countDocuments({isActive:true});
        const countOfUsersSuspended=await User.countDocuments({isActive:false});
        const countOfUsersConfirmed=await User.countDocuments({isConfirmed:true});
        const countOfAgencies=await Agency.countDocuments();
        const agencies=await Agency.find();
        let backgroundColors=[];
        let labels=[];
        let data=[];
        for await (const agency of agencies) {
            const clients = await Client.countDocuments({"agency": agency._id});
            data.push(clients);
            labels.push(agency.title);
            backgroundColors.push( randomColor({luminosity: 'light'}));
        }

        return res.send(
                {
                    countOfUsers:countOfUsers,
                    countOfUsersActive:countOfUsersActive,
                    countOfUsersSuspended:countOfUsersSuspended,
                    countOfUsersConfirmed:countOfUsersConfirmed,
                    countOfAgencies:countOfAgencies,
                    backgroundColors:backgroundColors,
                    data:data,
                    labels:labels
                }
        );

    }catch (error){
        return res.status(400).send({message:error.message});
    }
})

module.exports = router;
