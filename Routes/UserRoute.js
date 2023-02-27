const express = require("express");
const { postSignup, postSignin, postVerifyOtp, postLogout, regenareteOtp } = require("../Controller/UserController");
const userRouter = express.Router();
const { check, body } = require("express-validator");
const {isLoggedin,isAuth} = require("../middlewere/authCheck");

userRouter.post("/signin", [
    check("email", "Email is not valid").isEmail().trim(),
    body("password").custom((value, { req }) => {
        if (!value) {
            throw new Error("Password must not be empty")
        }
        return true
    }).trim(),
], postSignin)

userRouter.post("/signup", [
    check("name", "Name must be 4 characters long and only letters").isLength({ min: 4 }).isString().trim(),
    check("email").isEmail().withMessage("Email is not valid").trim(),
    check("password").isLength({ min: 8 }).withMessage("Password must be min 8 character long").trim()

], postSignup)


userRouter.post("/verifyOtp",postVerifyOtp)
userRouter.post("/logout",isLoggedin,isAuth, postLogout)
userRouter.post("/regenareteOtp",
 [
    check("email", "Please provide valid email address").isEmail().trim()
]
,regenareteOtp)
module.exports = userRouter