const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
require("dotenv").config();
const nodemailer = require("nodemailer");
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

exports.postSignup = async (req, res, next) => {
    const { name, email, password } = req.body
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
try{
    let result = await User.find({ email: email })
    if (result.length > 0) return res.json({ status: "Duplicate email", msg: "Email already exist" })
    let hashedPassword = await bcrypt.hash(password, 12)
    const otp = optGenerator.generate(6,
        {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
            digits: true
        })
    let user = new User({ name: name, 
        email: email, 
        password: hashedPassword, 
        otp: otp, 
        otpExpireTime: new Date() + 3600000, isVerified: false })

    let userDoc = await user.save()
    var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Verify your account',
        text: otp
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    if (userDoc) {
        return res.status(200).json(
            {
                "status": "Signup successfull",
                user: {
                    email: userDoc.email,
                    name: userDoc.name,
                    isVerified: userDoc.isVerified
                }
            })
    }
    else{
        return res.json({status:"failure",msg:"Something went wrong"})
    }
}catch(error){
    if (!error.statusCode) {
        err.statusCode = 500;
      }
      next(error);
}
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
        else if(!user.otp) return res.json({ "status": "Failure", "msg": "OTP expired" })
        else return res.json({ "status": "Failure", "msg": "OTP does not match" })

    }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}


exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return res.json({ "status": "Failure", "msg": "something went wrong" })
        else return res.json({ status: "Logged out", msg: "your logged out successfully" })

    })
}
exports.regenareteOtp = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())return res.json({error:errors.array()[0].msg});
    const { email } = req.body;
    const otp = optGenerator.generate(6,
        {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
            digits: true
        })
    User.findOne({ email: email }).then(user => {
        if (!user) return res.json({ status: "Failure", msg: "user with " + email + " email not found" })
        if(user.isVerified)return res.json({status:"failure",msg:"Your account is already verified"})
        user.otp = otp;
        user.otpExpireTime = new Date() + 3600000;
        user.save()
            .then(userDoc => {
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'Verify your account',
                    text: otp
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }

                });
                if (userDoc) return res.json({ staus: "success", msg: "OTP send succeaafully" })
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