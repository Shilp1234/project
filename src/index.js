const express=require('express')
const bodyParser=require("body-parser")
const routes=require("./routes/route")
const mongoose=require("mongoose")
const app=express();

app.use(bodyParser.json())

mongoose.connect("mongodb+srv://shilpikumari:shilpi1234@cluster0.phpas.mongodb.net/BookManagement-3",
   { useNewUrlParser:true},)


   .then(() => console.log("MongoDb is connected"))
   .catch((err) => console.log(err));

   app.use("/",routes)

   app.listen(process.env.PORT || 3000, function () {
    console.log("Express app is running on PORT " + (process.env.PORT || 3000));
  });
