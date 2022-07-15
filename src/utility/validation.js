const mongoose = require("mongoose")
const moment = require("moment")


/************[BODY EMAPTY]****************/
let isValidRequestBody = function (body) {
    if (Object.keys(body).length === 0) return false;
    return true;
}

/************[EMPTY FOR REQUIRED]*************/
let isEmpty = function (value) {
    if (typeof value === 'undefined' || value === null) return true;
    if (typeof value === 'string' && value.trim().length === 0) return true;
    return false;
}

/***********[VALID PHONE NUMBER USING REJEX]**********/
let isValidPhone = function (number) {
    let phoneRegex = /^[6-9]\d{9}$/;
    
    return phoneRegex.test(number);
}

/************[ISBN VALID USING REJEX]***********/
let isValidISBN = function (ISBN) {
    let ISBNRegex =/^[\d*\-]{10}|[\d*\-]{13}$/

   // let ISBNRegex=/^\+?([0-9]{3})\)?[-. ]?([0-9]{10})$/
    return ISBNRegex.test(ISBN);
}


/************[VALID EMAIL-ID USING REJEX]***********/
let isValidEmail = function (email) {
    let emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
    return emailRegex.test(email)
}


/***********[VALID PASSWORD USING REJEX]**********/
let isValidPassword = function (password) {
    let passwordRegex = /^(?=.[0-9])(?=.[!@#$%^&])[a-zA-Z0-9!@#$%^&]{8,15}$/
    return passwordRegex.test(password)
}

/************[VALID DATE FORMAT]**************/
let isValidDateFormat = function (date) {
    let dateFormatRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
    return dateFormatRegex.test(date)
}

/**************[VALID DATE]*************/
let isValidDate = function (date) {
    return moment(date).isValid()
}

/************[OBJECT ID IN DB]**************/
let isValidObjectId = function (ObjectId) {
    return mongoose.isValidObjectId(ObjectId)
}


/***********[PUBLICALLY ALL-METHOD'S]*************/
module.exports = {isValidRequestBody,
    isEmpty,
    isValidEmail,
    isValidPhone,
    isValidPassword,
    isValidObjectId,
    isValidDateFormat,
    isValidDate,
    isValidISBN
}