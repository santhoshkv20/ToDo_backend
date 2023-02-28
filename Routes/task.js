const express = require("express");
const taskRouter = express.Router();
const { check, body } = require("express-validator");
const { isLoggedin, isAuth } = require("../middlewere/authCheck");
const { postAddTask, getAllTodo, deletTodo, updateTodo, sortTask } = require("../Controller/task")

taskRouter.post("/newtodo", isLoggedin, isAuth,
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

taskRouter.get("/getAllTodo", isLoggedin, isAuth, getAllTodo)

taskRouter.post("/deletTodo/:taskId", isLoggedin, isAuth, deletTodo)

taskRouter.post("/updateTask/:taskId", isLoggedin, isAuth,
    [
        check("taskName").isString().isLength({ min: 4 }).withMessage("task name must be atleast 4 character"),
        body("date").custom((value, { req }) => {
            if (!value) {
                throw new Error("Date must not be empty")
            }
            return true
        }).trim(),
        check("status").isString().withMessage("Status not provided")

    ], updateTodo)

taskRouter.post("/sortTask", isLoggedin, isAuth, sortTask)
module.exports = taskRouter
