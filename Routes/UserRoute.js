const express = require("express");
const { postSignup, postSignin } = require("../Controller/UserController");
const userRouter = express.Router();
const { check, body } = require("express-validator")

userRouter.post("/signin", [
    check("email", "Email is not valid").isEmail().trim()
], postSignin)

userRouter.post("/signup", [
    check("name", "Name must be 4 characters long and only letters").isLength({ min: 4 }).isString().trim(),
    check("email").isEmail().withMessage("Email is not valid").trim(),
    check("password").isLength({ min: 8 }).withMessage("Password must be min 8 character long").trim()

], postSignup)
userRouter.post("/addTask")


module.exports = userRouter