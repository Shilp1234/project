const { isValidObjectId } = require("mongoose");
const reviewModel = require("../models/reviewModel");
const moment = require('moment');
const bookModel = require("../models/bookModel");
const validation = require('../utility/validation')
//const {isValidObjectId} = require("../utility/validation")


//================================================[CREATE REVIEW]] ================================================= 

const createReview = async (req, res) => {
    try{

            let bookId= req.params.bookId
            let data = req.body
            if(Object.keys(data).length==0){
                return res.status(400).send({status: false,msg:"Please Provide Some Data"})
            }
            data['bookId']=bookId
            
            if(!bookId){
                return res.status(400).send({status: false,msg:"Please Provide BookId"})
            }
            if(!isValidObjectId(bookId)){
                return res.status(400).send({status: false,msg:"Invalid BookId"})
            }
            let bookexist = await bookModel.findById(bookId)
            if(!bookexist){return res.status(403).send({status:false,msg:"No Book Found"})}
            if(bookexist['isDeleted']===true){return res.status(400).send({status:false,msg:"Book Has been Deletes"})}
        
            if(!data.rating){
                return res.status(400).send({status: false,msg:"Please Provide some rating"})

            }
            if(!data.reviewedBy){
                let reviewedBy = "Guest"
                data['reviewedby'] = reviewedBy
            }
            if(!data.review){
                return res.status(400).send({status: false,msg:"Please Tell Us About Ur Review For This Book"})
            }

            let date = Date.now()
            let reviewedAt = moment(date).format("YYYY-MM-DD, hh:mm:ss")
            data['reviewedAt'] = reviewedAt

            const reviewes = await reviewModel.create(data)
            if(reviewes){
                const bookReviwes = await bookModel.findOneAndUpdate({_id:data.bookId},{$inc:{reviews:+1}},{new:true})
            }
            let result = bookexist.toObject()
            result.reviewData = reviewes
            return res.status(201).send({status:true, msg:"Reviewes Added Succesfully",data:result})
        
    }catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}

/************************************************[UPDATE REVIEW]*******************************************/

const updateReview = async (req, res) => {
    try {

        // get book id
        const bookId = req.params.bookId
        if (!isValidObjectId(bookId)) return res.status(400).send({status: false,message: "BookId invalid"})
        // get review id id
        const reviewId = req.params.reviewId
        if (!isValidObjectId(reviewId)) return res.status(400).send({status: false,message: "ReviewId invalid"})
        // get revirw data from body for updata
        const dataForUpdate = req.body
        // dataForUpdate is valid or not
        if (!validation.isValidRequestBody(dataForUpdate)) 
            return res.status(400).send({status: false,message: "Data for updation is required!"})

        // check book from db ---
        const isBook = await bookModel.findById(bookId).catch(_ => null)
        // check if exist or not
        if (!isBook) return res.status(404).send({status: false,message: 'Book not found!'})

        // check if book is deleted
        if (isBook.isDeleted) return res.status(404).send({status: false, message: "Book already deleted, can't edit review!"})


        // check Review from db --
        const isReview = await reviewModel.findById(reviewId).catch(_ => null)
        // check if exist or not
        if (!isReview) return res.status(404).send({status: false,message: 'Review not found!' })

        // check if ReviewId OR bookId are not related to each other
        if (isReview.bookId.toString() !== bookId) return res.status(404).send({status: false,message: "ReviewId does not belong to particular book !"})

        // check if Review is deleted
        if (isReview.isDeleted) return res.status(404).send({status: false, message: "Review already deleted!"})

        // destructure body data
        let {review,rating,reviewedBy} = dataForUpdate

        // validate review's review, rating, name
        if (!validation.isEmpty(review)) {
            isReview.review = review
        }

        // review validation
        if (!validation.isEmpty(rating)) {
            if (typeof rating !== 'number') return res.status(400).send({Status: false,message: "rating must be number only"})
            // Rating must be in 1 to 5
            if (rating < 1 || rating > 5) return res.status(400).send({status: false,message: 'Rating must be in 1 to 5!' })
                
            // overwrite rating if ok case
            isReview.rating = rating
        }

        if (!validation.isEmpty(reviewedBy)) {
            isReview.reviewedBy = reviewedBy
        }

        // update review Data by using .save()
        await isReview.save() 
        res.status(200).send({
            status: true,
            //data: await bookWithReviewList(bookId)
            data:isReview
        })

    } catch (e) {
        res.status(500).send({
            status: false,
            message: e.message
        })
    }
}

/************************************************[DELETE REVIEW]*******************************************/
const deleteReview = async (req, res) => {
    try{
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;

        let book = await bookModel.findById(bookId);
        if(book){
            if(book['isDeleted'] == true) return res.status(400).send({status: false, message: "The book has been deleted"});
        }else return res.status(404).send({status: false, message: "Book not found"});

        let review = await reviewModel.findById(reviewId);
        if(review){
            if(review['isDeleted'] == true) return res.status(400).send({status: false, message:"Review has been deleted"});
        }else return res.status(404).send({status: false, message: "Review not found"});

        await reviewModel.findOneAndUpdate({_id: reviewId},{isDeleted: true},{new: true});
        await bookModel.findOneAndUpdate({_id: bookId},{$inc: {reviews: -1}}, {new: true});

        res.status(200).send({status: true, message: "Review deleted successfully"});
    }catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}


module.exports = {createReview,updateReview,deleteReview};



