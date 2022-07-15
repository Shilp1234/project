const userModel=require("../models/userModel")
const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}
const isValidReqBody = function(reqBody){
    return Object.keys(reqBody).length >0
}
//const isValidName=/^[a-zA-Z]{2,7}$/
//const isValidEmail=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
//const isValidPhone=/^[0]?[6789]\d{9}$/
//const isValidPassword="^(?=.[a-z])(?=.[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$"

/*************************************************[CREATE USER]******************************************/
const createUser= async function(req,res){
    try{
        let data=req.body
        const{title,name,phone,email,password,address}=data
        if(!isValidReqBody(data)){
            return res.status(400).send({status:false,msg:"please provide user details in body"})
        }
        if(!title){
            return res.status(400).send({status:false,msg:"title is required"})
        }
        var regEx = /^[a-zA-Z]+/;
        if (!regEx.test(title)) {
            return res.status(400).send({ status: false, msg: "title text is invalid" });
        }
            //check the title is valid or not ?
        if (!(["Mr", "Mrs", "Miss"].includes(title))) {
            return res.status(400).send({ status: false, msg: 'You Can enter Only [Mr, Mrs, Miss] in Title in this format ' });
        }
        if(!name){
            return res.status(400).send({status:false,msg:"name is required"})
        }
        if(!phone){
            return res.status(400).send({status:false,msg:"phone no is required"})
        }
        if(!/^[0]?[6789]\d{9}$/.test(phone)){
            return res.status(400).send({status:false,msg:"Please provide phone no 10 digit"}) 
        }
        // if(!/^[a-zA-Z]{2,10}$/.test(name)){
        //     return res.status(400).send({status:false,msg:"Please provide valid name"})
        // }
        if(!email){
            return res.status(400).send({status:false,msg:"Please Enter email"})
        }
        if(!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)){
            return res.status(400).send({status:false,msg:"Please Enter Valid Email Id"})
        }
        if(!password){
            return res.status(400).send({status:false,msg:"Please Enter password"})
        }
        if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password)){
            return res.status(400).send({status:false,msg:"Password is not currect format at least 8 character is required"}) 
        }
        const userData=await userModel.create(data)
        return res.status(201).send({status:true,msg:" User Create Successfully",data:userData})
    }catch(err){
        res.status(500).send({status:false,msg:err.message})
    }
}
/*********************************************[LOGIN USER]*****************************************/
const userLogin=async function(req,res){
    try{
        let data=req.body
        const{email,password}=data

        if(!isValidReqBody(data)){
            return res.status(400).send({status:false,msg:"Please Enter the email and password in Request Body"})
        }
        if(!email){
            return res.status(400).send({status:false,msg:"please Enter email id"})
        }
        // if (!isValid(email)) {
        //     return res.status(400).send({ status: false, msg: "Email Id is Invalid" });
        // }
        if(!password){
            return res.status(400).send({status:false,msg:"please Enter password"})
        }
        const userData=await userModel.findOne({email:email,password:password})
        if(!userData){
            return res.status(400).send({status:false,msg:"email or password is not corerct"})
        }

        let token=jwt.sign(
            {
                userId:userData._id.toString(), //payload
                expiredate: "30d"
            },
            "PROJECT-3_BOOKMANAGEMENT"
        )
        res.setHeader("x-api-key",token)
        res.status(201).send({status:true,msg:"Create Successfully",data:token})
    }catch(err){
        res.status(500).send({status:false,msg:err.message})
    }
}


module.exports.createUser=createUser
module.exports.userLogin=userLogin