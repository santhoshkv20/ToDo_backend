const bcrypt = require("bcryptjs")
const User = require("../Schema/User")

exports.postSignin = (req,res)=>{
const {email,password} = req.body

    User.findOne({ email }).then(user => {
        console.log(user)
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
    })
}

exports.postSignup = (req, res) => {
    const { name, email, password } = req.body
    bcrypt.hash(password, 12).then(hashedPassword => {
        let user = new User({ name: name, email: email, password: hashedPassword })
        user.save().then(user => {
            res.status(200).json(user)
            //send OTP
        }).catch(err => {
            console.log(err)
        });
    }).catch(err => {
        console.log("Something went wrong in hashing password ", err)
    })

}