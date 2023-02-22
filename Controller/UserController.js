const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")
const User = require("../Schema/User")

exports.postSignin = (req, res) => {
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

exports.postSignup = (req, res) => {
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