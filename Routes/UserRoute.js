const express = require("express");
const { postSignup, postSignin } = require("../Controller/UserController");
const userRouter = express.Router();

userRouter.post("/signin",postSignin)
userRouter.post("/signup",postSignup)


module.exports = userRouter