const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")
const  mongoose = require("mongoose")
const User = require("../Schema/User")


exports.postSignin = (req, res,next) => {
    const { email, password } = req.body
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });

    User.findOne({ email }).then(user => {
        if (!user) return res.status(422).json({ "STATUS": "Failure", "message": "Email or password does not match" })
        bcrypt.compare(password, user.password).then(doMacth => {
            if (doMacth) {
                req.session.user = user
                return req.session.user.save().then(re => {
                    return res.json({ "STATUS": "SUCCESS", "user": user })

                })
            }
            else {
                return res.status(422).json({ "STATUS": "Failure", "message": "Email or password does not match" })
            }
        })
    }).catch(err=>{
        const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}

exports.postSignup = (req, res,next) => {
    const { name, email, password } = req.body
    const errors = validationResult(req);
    if(!errors.isEmpty())return res.json({error:errors.array()[0].msg});
    bcrypt.hash(password, 12).then(hashedPassword => {
        let user = new User({ name: name, email: email, password: hashedPassword })
        user.save().then(user => {
            res.status(200).json(user)
            //send OTP
        }).catch(err => {
            const error =  new Error(err)
            error.httpStatusCode = 500
            return next(error)
        });
    }).catch(err => {
        const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })

}

exports.postAddTask = (req, res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())return res.json({error:errors.array()[0].msg});
    User.findOne({ email: req.session.user.email }).then(user => {
        user.addTask(req.body).then(task => {
            return res.json({ task: task })
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
    endLimit = !endLimit ? 1 : endLimit;
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

exports.updateTodo = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty())return res.json({error:errors.array()[0].msg});
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
            if(!user)return res.json({"status":"Failure","msg":"Task not found"})
            return res.json({ user })

        }).catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}