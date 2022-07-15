const{isValidObjectId,default:mongoose}=require("mongoose")
const bookModel=require("../models/bookModel")
const userModel=require("../models/userModel")
const reviewModel=require("../models/reviewModel")
const moment=require("moment")

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}
const isValidReqBody = function(reqBody){
    return Object.keys(reqBody).length >0
}
/***************************************************************[CREATE BOOK]***************************************************************/
const createBook = async function(req,res){
    try{
        let data=req.body
        const{title,excerpt,userId,ISBN,category,subcategory}=data
        if(!isValidReqBody(data)){
            return res.status(400).send({status:false,msg:"please provide Book details in body"})
        }

        if(!title)  return res.status(400).send({status:false,msg:"title is required"})
         checktitle = await bookModel.findOne({ title: title });
        if(checktitle)  return res.status(400).send({status:false,msg:"Title is Already Exists"})

        if (!/^[a-zA-Z]+/.test(title)){
            return res.status(400).send({ status: false, msg: "Please Enter Only Alphabets in title" });
        
        }
        if(!excerpt) return res.status(400).send({status:false,msg:"title is required"})

        if (!/^[a-zA-Z \s]+$/.test(excerpt)){
            return res.status(400).send({ status: false, msg: "Please Enter Only Alphabets in excerpt" });
        }
        if(!userId)  return res.status(400).send({status:false,msg:"userId is required"})
        
        let user = await userModel.findById({ _id: userId });

        if (!user) return res.status(404).send({ status: false, msg: "No such user exist" });
        
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: " invalid objectId" });
        
        if(!ISBN) return res.status(400).send({status:false,msg:"ISBN is required"})
        
        if(!/^[\d*\-]{10}|[\d*\-]{13}$/.test(ISBN)){
            return res.status(400).send({status:false,msg:"Please provide ISBN valid(ISBN should be 13 digit)"})
        }
        let checkISBN= await bookModel.findOne({ISBN:ISBN});
        if(checkISBN) return res.status(400).send({status:false,msg:"ISBN is Already Exists"})

        if(!category){
            return res.status(400).send({status:false,msg:"category is required"})
        }
        if(!/^[a-zA-Z \s]+$/.test(category)){
            return res.status(400).send({ status: false, msg: "Please Enter Only Alphabets in excerpt" });
        }
        if(!subcategory){
            return res.status(400).send({status:false,msg:"subcategory is required"})
        }
        // if(!reviews){
        //     return res.status(400).send({status:false,msg:" is required"})
        // }
       
        if (data.isDeleted == true) data.deletedAt = Date.now()

        let date = Date.now(); //getting timestamps value
        let releasedAt = moment(date).format("YYYY-MM-DD, hh:mm:ss"); //formatting date
        //data["releasedAt"] = releasedAt;
        if (!releasedAt) return res.status(400).send({ status: false, message: "ReleasedAt must be Present" })

        bookData= await bookModel.create(data)
        return res.status(201).send({status:true,msg:"Book Create successfully",data:bookData})
    }catch(err){
        return res.status(500).send({ status: false, msg: err.message })
    }
}

/******************************************************[GET BOOK]**********************************************/
const getBook = async (req, res) => {
    try {
        let data = req.query;
        let { userId, category, subcategory } = data;
        let filter = {
            isDeleted: false,
            ...data
        };
        if (userId) {
            if (!isValidObjectId(userId)) {
                res.status(400).send({ status: false, message: "This is not a valid user id" });
            }
            let findById = await userModel.findOne({ userId });
            if (!findById) {
                res.status(404).send({ status: false, message: "No user with this id exist" });
            }
        }
        if (category) {
            let findByCategory = await userModel.findOne({ category: category });
            if (!findByCategory) {
                res.status(404).send({ status: false, message: "No books with this category exist" });
            }
        }
        if (subcategory) {
            let findBySubcategory = await userModel.findOne({ subcategory: { $in: [subcategory] } });
            if (!findBySubcategory) {
                res.status(404).send({ status: false, message: "No books with this Subcategory exist" });
            }
        }

        let books = await bookModel.find(filter).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: +1 });
        if (books.length == 0) {
            return res.status(404).send({ status: false, message: "No books found with the given query" });
        }

        res.status(200).send({ status: true, message: "Book lists", data: books });

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}

/***********************************************[GET BOOK BY ID]******************************************/
const getBookById = async (req, res) => {
    try {
        let id = req.params.bookId;

        let bookData = await bookModel.findOne({_id: id, isDeleted: false}).select({_v: 0})
        let reviews = await reviewModel.find({bookId:id}).select({_id:0,_v:0})
       let result = bookData.toObject()
        result.reviewsData = reviews;

        res.send({status: true, message: 'Book list', data: result});
    }catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}

/***********************************************[UPDATE BOOK ]******************************************/
const updateBooks = async function (req, res) {
    try {
        let data = req.body;
        let bookId = req.params.bookId
        let { title, excerpt, releasedAt, ISBN } = data   // destructring


        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "please provide details what you want to update" })
        }
       

        let books = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!books) {
            return res.status(404).send({ status: false, msg: "No such book found" })
        }
        if (!title) {
            return res.status(400).send({ status: false, msg: " title is required to update" })
        }
        if (!/^[a-zA-Z \s]+$/.test(title)) {
            return res.status(400).send({ status: false, msg: "Please Enter Only Alphabets in title" })
        }

        let titleAlreadyUsed = await bookModel.findOne({ title: title })
        if (titleAlreadyUsed) {
            return res.status(400).send({ status: false, msg: "title Already exist please provide another title" })
        }
        if (!ISBN) {
            return res.status(400).send({ status: false, msg: " ISBN is required to update" })
        }

        if (!/^\+?([0-9]{3})\)?[-. ]?([0-9]{10})$/.test(ISBN)) {
            return res.status(400).send({ status: false, message: 'Please provide a valid ISBN(ISBN should be 13 digit)' })
        }

        let ISBNAlreadyUsed = await bookModel.findOne({ ISBN: ISBN })
        if (ISBNAlreadyUsed) {
            return res.status(400).send({ status: false, msg: "ISBN Already exist please provide another ISBN" })
        }
        if (!excerpt) {
            return res.status(400).send({ status: false, msg: "excerpt is required to update" })
        }

        if (!/^[a-zA-Z \s]+$/.test(excerpt)) {
            return res.status(400).send({ status: false, msg: "Please Enter Only Alphabets in excerpt" })
        }
        if (!releasedAt) {
            return res.status(400).send({ status: false, msg: "releaseAt is required to update" })
        }
        if (releasedAt) {
            if (!/((\d{4}[\/-])(\d{2}[\/-])(\d{2}))/.test(releasedAt)) {
                return res
                    .status(400)
                    .send({
                        status: false,
                        message: "Please provide a valid Date(YYYY-MM-DD)",
                    });
            }
            const updatedBookData = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN }, { new: true })
            res.status(200).send({ status: true, msg: "successfully update book details", data: updatedBookData })

        }
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}

const deleteById = async function (req,res){
    try{
            let bookId = req.params.bookId
            let bookexist = await bookModel.findOne({_id:bookId,isDeleted:false})
            if(!bookexist){
                return res.status(404).send({status:false,msg:"Book Not Found"})                                  
            }

            let date = Date.now()                                               //getting timestamps value
            let deletedAt = moment(date).format('YYYY-MM-DD, hh:mm:ss')        //formatting date
            let deleteBook = await bookModel.findOneAndUpdate({_id:bookId},
            {$set:{isDeleted:true,deletedAt:deletedAt}},
            {new:true})
                                
            if(deleteBook){
                return res.status(200).send({status:true,msg:"Book is Deleted"})
            } 
    }   
    catch(err){
        return res.status(500).send({status:false,msg:err.message})
    }                                               

}

 module.exports={createBook,getBook,getBookById,updateBooks,deleteById}