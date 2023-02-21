const express = require("express");
const { postSignup } = require("../Controller/UserController");
const userRouter = express.Router();

userRouter.get("/signin")
userRouter.post("/signup",postSignup)


module.exports = userRouter