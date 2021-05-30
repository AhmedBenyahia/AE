const express = require('express');
const router = express.Router();
const {Agency, validate} = require('../model/agency');
const _=require('lodash');
const {User} =require('../model/user');
const authorization = require('../middleware/authorization');
const adminAuthorization = require('../middleware/adminAuthorisation');
const validateObjectId = require('../middleware/validateObjectId');


router.get('/:id',[authorization,validateObjectId],async (req,res)=>{
   try{
       let agency=await Agency.findById(req.params.id);
       if(!agency)
           return res.status(404).json('Agency not found');
       return res.status(200).json(agency);
   }catch (error){
       return res.status(400).send(error.message)
   }


});
router.put('/:id',[authorization,validateObjectId],async (req,res)=>{
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

router.post('/', authorization,async (req, res) => {
    // validate the request body
    const {error} = validate(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
    // create new agency instance
    const agency = new Agency(req.body);
    // save the new agency in the database
    await agency.save();
    let user=await User.findById(req.user._id);
    if(!user) return res.status(404).json('User not found');

    user.agency=agency._id;
    user.save();
    res.send(user);
});


module.exports = router;
