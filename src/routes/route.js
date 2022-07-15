const express=require("express")
const router=express.Router()
const userController=require("../controller/usercontroller")
const bookcontroller=require("../controller/bookcontroller")
const reviewController=require("../controller/reviewcontroller")
const{authentication,authorisation}=require("../middleware/midd")


router.post("/register",userController.createUser)
router.post("/login",userController.userLogin)

router.post("/books",authentication,authorisation,bookcontroller.createBook)
router.get("/books",authentication,bookcontroller.getBook)
router.get("/books/:bookId",authentication,authorisation,bookcontroller.getBookById)
router.put("/books/:bookId",authentication,authorisation,bookcontroller.updateBooks)
router.delete("/books/:bookId",authentication,authorisation,bookcontroller.deleteById)

router.post("/books/:bookId/review",reviewController.createReview)
router.put("/books/:bookId/review/:reviewId",reviewController.updateReview)
router.delete("/books/:bookId/review/:reviewId",reviewController.deleteReview)

module.exports=router