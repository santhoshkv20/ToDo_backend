const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const mongoose = require("mongoose");
const userRouter = require("./Routes/UserRoute");
require("dotenv").config();


const app = express();
app.use(bodyParser.json());
app.use(cors())
app.use(userRouter)

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_CONNECT)
    .then(res => {
        app.listen(4000)
    })
    .catch(err => {
        console.log(err)
    })



