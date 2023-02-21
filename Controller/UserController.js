const bcrypt = require("bcryptjs")
const User = require("../Schema/User")

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