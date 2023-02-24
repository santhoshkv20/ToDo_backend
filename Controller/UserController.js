const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
require("dotenv").config();
const nodemailer = require("nodemailer");
const  mongoose = require("mongoose")
const User = require("../Schema/User");
const optGenerator = require("../Utils/optGenerator");

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });

exports.postSignin = (req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
    const { email, password } = req.body

    User.findOne({ email }).select('email name isVerified password').then(user => {
        if (!user) return res.status(422).json({ "status": "Failure", "message": "Email or password does not match" })
        if(!user.isVerified)return res.json({"status":"Failure","msg":"Your account is not verified.Please check your email for the OTP"})
        bcrypt.compare(password, user.password).then(doMacth => {
            if (doMacth) {
                req.session.user = user
                let token  = jwt.sign(email+password,process.env.SECREATE)
                return req.session.user.save().then(result => {
                    if (result) return res.json({
                        "status": "SUCCESS", user: {
                            email: user.email,
                            name: user.name,
                            isVerified: user.isVerified,
                            token:token
                        }
                    })
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
        const otp = optGenerator.generate(6,
            {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false,
                digits: true
            })
        let user = new User({ name: name, email: email, password: hashedPassword ,otp:otp,otpExpireTime:new Date()+3600000,isVerified:false})
        user.save().then(user => {
            var mailOptions = {
                from: process.env.EMAIL,
                to:email,
                subject: 'Verify you account',
                text: otp
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
            return res.status(200).json(
                {
                    "status": "Signup successfull",
                    user: {
                        email: user.email,
                        name: user.name,
                        isVerified: user.isVerified
                    }
                })
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

exports.postVerifyOtp = (req, res, next) => {
    const { otp, email } = req.body;
    User.findOne({ email }).then(user => {
        if (!user) return res.json({ status: "Failure", "msg": "Email not found.Please check your email" })
        if (user.otpExpireTime > Date.now()) return res.json({ status: "Failure", "msg": "OTP expired" })
        if (otp == user.otp) {
            user.otp = undefined;
            user.otpExpireTime = undefined
            user.isVerified = true;
            user.save().then(updatedDoc => {
                if (updatedDoc) return res.json({ "status": "Success", "msg": "OTP successfully  verified" })
            });
        }
    }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}

exports.postAddTask = (req, res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())return res.json({error:errors.array()[0].msg});
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
            if(!userDoc) return res.json({ status:"Failure",msg:"Could not delete the task." })
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
            return res.json({ status:"Success",msg:"Task updated successfully" })

        }).catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.sortTask=(req,res,next)=>{
    let sortList = req.body
    User.findOne({email:req.session.user.email}).then(user=>{
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
            return res.send({ "taskUpdated":user.todoTask })

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