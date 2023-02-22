const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const mongoose = require("mongoose");
const session  = require("express-session")
const mongodbStore = require("connect-mongodb-session")(session)
const userRouter = require("./Routes/UserRoute");
require("dotenv").config();

const store = new mongodbStore({
    uri:process.env.MONGODB_CONNECT,
    collection:"sessions",
    expires:  1000 * 30,
  })

const app = express();
app.use(bodyParser.json());
app.use(cors())
app.use(session({secret:"TODOBACKEND",resave:false,saveUninitialized:false,store:store}))

app.use(userRouter)

app.use((error,req,res,next)=>{
    res.json({error:"something went wrong "+error })
  })
  
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_CONNECT)
    .then(res => {
        console.log("connected")
        app.listen(4000)
    })
    .catch(err => {
        console.log(err)
    })



