const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
require("dotenv").config();
const User = require("../Schema/User");
const { sendMail } = require("../Utils/emailHelper");
const { hanldeError } = require("../Utils/handleErrorHelper");
const optGenerator = require("../Utils/optGenerator");



exports.postSignin = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
    const { email, password } = req.body

    User.findOne({ email }).select('email name isVerified password').then(user => {
        if (!user) return res.status(422).json({ status: "failure", message: "Email or password does not match" })
        if (!user.isVerified) return res.json({ status: "failure", message: "Your account is not verified.Please check your email for the OTP" })

        bcrypt.compare(password, user.password).then(doMacth => {
            if (doMacth) {
                req.session.user = user
                let token = jwt.sign({ token: email + password }, process.env.SECREATE, { expiresIn: "5m" })
                return req.session.user.save().then(result => {
                    if (result) return res.json({
                        status: "success", 
                        user: {
                            email: user.email,
                            name: user.name,
                            isVerified: user.isVerified,
                            token: token
                        }
                    })
                })
            }
            else {
                return res.status(422).json({ status: "failure", message: "Email or password does not match" })
            }
        })
    }).catch(err => {
        hanldeError(next, err)
    })
}

exports.postSignup = async (req, res, next) => {
    const { name, email, password } = req.body
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({status: "error", error: errors.array()[0].msg });
    try {
        let result = await User.find({ email: email })
        if (result.length > 0) return res.json({ status: "Duplicate email", message: "Email already exist" })
        let hashedPassword = await bcrypt.hash(password, 12)

        const otp = optGenerator.generate(6,
            {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false,
                digits: true
            })
        let user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            otp: otp,
            otpExpireTime: new Date() + 3600000, isVerified: false
        })

        let userDoc = await user.save()

        if (userDoc) {
            let msg = await sendMail(email, "verify your account", otp)
            if (msg.accepted) {
                return res.status(200).json(
                    {
                        "status": "signup successfull",
                        user: {
                            email: userDoc.email,
                            name: userDoc.name,
                            isVerified: userDoc.isVerified
                        }
                    })
            }
            else {
                return res.status(200).json(
                    {
                        "status": "signup successfull",
                        user: {
                            email: userDoc.email,
                            name: userDoc.name,
                            isVerified: userDoc.isVerified
                        },
                        additionalInfo: "Something went wrong. Can not send mail, Please try again"
                    })
            }
        }
        else {
            return res.json({ status: "failure", message: "Something went wrong" })
        }
    } catch (error) {
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
        if (user.otpExpireTime > Date.now()) return res.json({ status: "Failure", message: "OTP expired" })
        if (otp == user.otp) {
            user.otp = undefined;
            user.otpExpireTime = undefined
            user.isVerified = true;
            user.save().then(updatedDoc => {
                if (updatedDoc) return res.json({ status: "Success", message: "OTP successfully  verified" })
            });
        }
        else if (!user.otp) return res.json({ status: "Failure", message: "OTP expired" })
        else return res.json({ status: "Failure", message: "OTP does not match" })

    }).catch(err => {
        hanldeError(next, err)
    })
}


exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return res.json({ status: "Failure", message: "something went wrong" })
        else return res.json({ status: "Logged out", message: "your logged out successfully" })

    })
}
exports.regenareteOtp = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
    const { email } = req.body;
    const otp = optGenerator.generate(6,
        {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
            digits: true
        })

    User.findOne({ email: email }).then(user => {
        if (!user) return res.json({ status: "Failure", message: "user with " + email + " email not found" })
        if (user.isVerified) return res.json({ status: "failure", message: "Your account is already verified" })
        user.otp = otp;
        user.otpExpireTime = new Date() + 3600000;
        user.save()
            .then(userDoc => {
                sendMail(email, "Verify your account", otp).then(data => {
                    if (data.accepted) if (userDoc) return res.json({ status: "success", message: "OTP send succeaafully" })
                    else return res.json({ status: "success", message: "Somethig went wrong ,please try again" })
                })

            }).catch(err => {
                hanldeError(next, err)
            })

    }).catch(err => {
        hanldeError(next, err)
    })
}