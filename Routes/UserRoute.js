const express = require("express");
const { postSignup, postSignin, postAddTask, getAllTodo, deletTodo, updateTodo, sortTask, postVerifyOtp, postLogout } = require("../Controller/UserController");
const userRouter = express.Router();
const { check, body } = require("express-validator");
const {isLoggedin,isAuth} = require("../middlewere/isLoggedin");

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

userRouter.post("/newtodo",isLoggedin,isAuth,
[
    check("taskName").isString().isLength({ min: 4 }).withMessage("task name must be atleast 4 character"),
    body("date").custom((value, { req }) => {
        if (!value) {
            throw new Error("Date must not be empty")
        }
        return true
    }).trim(),
    check("status").isString().withMessage("Status not provided")
]
    , postAddTask);

userRouter.get("/getAllTodo",isLoggedin,isAuth,getAllTodo)

userRouter.post("/deletTodo/:taskId",isLoggedin,isAuth,deletTodo)

userRouter.post("/updateTask/:taskId",isLoggedin,isAuth,
[
    check("taskName").isString().isLength({ min: 4 }).withMessage("task name must be atleast 4 character"),
    body("date").custom((value, { req }) => {
        if (!value) {
            throw new Error("Date must not be empty")
        }
        return true
    }).trim(),
    check("status").isString().withMessage("Status not provided")

],updateTodo)

userRouter.post("/sortTask",isLoggedin,isAuth,sortTask)
userRouter.post("/verifyOtp",postVerifyOtp)
userRouter.post("/logout",isLoggedin,isAuth, postLogout)
module.exports = userRouter