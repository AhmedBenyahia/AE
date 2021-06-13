const {Car} = require('../model/car');
const {Client}=require('../model/client');
const {Monitor}=require('../model/monitor');
const {Exam}=require('../model/exam');
const {Session}=require('../model/session');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const validateAgencyObjectId = require('../middleware/validateAgencyObjectId');
const authorization = require('../middleware/authorization');



router.get('/:agency',[authorization,validateAgencyObjectId],async (req,res)=>{
    try{
        const countOfClients=await Client.countDocuments({agency:req.params.agency});
        const countOfCars=await Car.countDocuments({agency:req.params.agency});
        const countOfMonitors=await Monitor.countDocuments({agency:req.params.agency});
        const countOfSessions=await Session.countDocuments({agency:req.params.agency});
        const countOfExams=await Exam.countDocuments({agency:req.params.agency});
        const examsPerMonthQuery=await Exam.aggregate([
            {$match:{agency:mongoose.Types.ObjectId(req.params.agency)}},
            {
                $group: {
                    _id: {month: {$month: "$examDate"}},
                    count: {$sum: 1},
                }
            }
        ])
        const sessionsPerMonthQuery=await Session.aggregate([
            {$match:{agency:mongoose.Types.ObjectId(req.params.agency)}},
            {
                $group: {
                    _id: {month: {$month: "$startDate"}},
                    count: {$sum: 1},
                }
            }
        ])
        let examsPerMonth=[];
        for(let i=0;i<12;i++){
            const month=examsPerMonthQuery.filter((el)=>el._id.month===i+1);
            //console.log(month)
            if(month.length!==0)
                examsPerMonth[i]=month[0].count;
            else
                examsPerMonth[i]=0;
        }
        let sessionsPerMonth=[];
        for(let i=0;i<12;i++){
            const month=sessionsPerMonthQuery.filter((el)=>el._id.month===i+1);
            //console.log(month)
            if(month.length!==0)
                sessionsPerMonth[i]=month[0].count;
            else
                sessionsPerMonth[i]=0;
        }

        return res.send(
                {
                        countOfCustomers:countOfClients,
                        countOfCars:countOfCars,
                        countOfMonitors:countOfMonitors,
                        countOfSessions:countOfSessions,
                        countOfExams:countOfExams,
                        examsPerMonth:examsPerMonth,
                        sessionsPerMonth:sessionsPerMonth,
                     }
            );
    }catch (error){
        return res.status(400).send({message:error.message});
    }
})
module.exports = router;
