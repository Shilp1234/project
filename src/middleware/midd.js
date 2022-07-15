const Bookmodel = require("../models/bookModel")
const jwt=require("jsonwebtoken")
const mongoose = require("mongoose")

/*************************************************[AUTHENTICATION]*********************************************/
const authentication=(req,res,next)=>{
    try{
        let  token=req.headers["x-api-key"]
        if(!token){
        return  res.status(400).send({ status: false, message: "token is not present"})

        }
        let decodetoken=jwt.verify(token,"PROJECT-3_BOOKMANAGEMENT")
        if(!decodetoken){
            return  res.status(401).send({ status: true, message: "authetication not successfull"})

        }
        next()
    }catch(err){
        res.status(500).send({ status: false, message: err.message })
    }
}

/***********************************************[AUTHORISATION]*******************************************/
const authorisation=async(req,res,next)=>{
    try{
        const token=req.headers["x-api-key"]
        if(!token){
            return res.status(400).send({ status: false, message: "token not found"})

        }
        const bookId=req.params.bookId
        //for createuser we are taking userId from body
        const userId=req.body.userId
        
        if(bookId){
            if (!mongoose.isValidObjectId(bookId)) {
                return res.status(400).send({ status: false, message: "bookId is not valid" })
            }
        }else {
            if (!mongoose.isValidObjectId(userId)) {
                return res.status(400).send({ status: false, message: "userId is not valid" })
            }
        }
        let decodetoken=jwt.verify(token,"PROJECT-3_BOOKMANAGEMENT")
            //authorizATION checking
            //  if(getbooks.userId!=decodetoken.userId){
            //     return res.status(403).send({ status: false, message: "authorisation failed"})
        //}
        if(bookId){
        const getbooks=await Bookmodel.findOne({_id:bookId,userId:decodetoken.userId})
        if(!getbooks){
            return res.status(403).send({ status: false, message: "authorisation not successfull"})
        }
        }else{
        if(userId!=decodetoken.userId){
            return res.status(403).send({ status: false, message: "authorisation not successfull by userId"})   
        }
        }

        next()
    }catch(err){
       return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports={authentication,authorisation}