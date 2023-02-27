const { validationResult } = require("express-validator")
const mongoose = require("mongoose")
const User = require("../Schema/User");

exports.postAddTask = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
    User.findOne({ email: req.session.user.email }).then(user => {
        user.addTask(req.body).then(task => {
            return res.json({ task: task.todoTask })
        })
            .catch(err => {
                const error = new Error(err)
                error.httpStatusCode = 500
                return next(error)
            })
    }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}

exports.getAllTodo = (req, res, next) => {
    let startLimit = parseInt(req.query.startLimit)
    let endLimit = parseInt(req.query.endLimit)
    startLimit = !startLimit ? 0 : startLimit;
    endLimit = !endLimit ? 10000000 : endLimit;
    User.findOne({ email: req.session.user.email }, { todoTask: { $slice: [startLimit, endLimit] } }).then(userData => {
        return res.json({ "Alltask": userData.todoTask })
    }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}

exports.deletTodo = (req, res, next) => {
    const taskId = req.params.taskId
    if (!taskId) return res.json({ "status": "data not suffient", "msg": "Task id not provided" })
    User.findOne({ email: req.session.user.email }).then(user => {
        user.removeTask(taskId).then(userDoc => {
            if (!userDoc) return res.json({ status: "Failure", msg: "Could not delete the task." })
            return res.json({ allTask: userDoc.todoTask })
        }).catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        });
    }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    });
}

exports.updateTodo = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
    const taskId = req.params.taskId
    const { taskName, date, status } = req.body
    User.findOneAndUpdate({
        email: req.session.user.email, 'todoTask._id': mongoose.Types.ObjectId(taskId)
    },
        {
            $set: {
                'todoTask.$.taskName': taskName,
                'todoTask.$.date': date,
                'todoTask.$.status': status
            }
        }).then(user => {
            if (!user) return res.json({ "status": "Failure", "msg": "Task not found" })
            return res.json({ status: "Success", msg: "Task updated successfully" })

        }).catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.sortTask = (req, res, next) => {
    let sortList = req.body
    User.findOne({ email: req.session.user.email }).then(user => {
        let tasklist = [...user.todoTask];
        sortList.forEach((val, index) => {
            tasklist.forEach((task, i) => {
                if (task._id.toString() == val.toString()) {
                    const startIndex = i < 0 ? tasklist.length + i : i;
                    if (startIndex >= 0 && startIndex < tasklist.length) {
                        const endIndex = index < 0 ? tasklist.length + index : index;
                        const [item] = tasklist.splice(i, 1);
                        tasklist.splice(endIndex, 0, item);
                    }
                }
            })
        })
        user.todoTask = tasklist
        return user.save().then(user => {
            return res.send({ "taskUpdated": user.todoTask })

        }).catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
    }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}
