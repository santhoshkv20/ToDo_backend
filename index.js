const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const mongoose = require("mongoose")
require("dotenv").config();


const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())


mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_CONNECT)
    .then(res => {
        app.listen(4000)
    })
    .catch(err => {
        console.log(err)
    })



