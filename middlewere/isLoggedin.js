const jwt = require("jsonwebtoken")

exports.isLoggedin =(req,res,next)=>{
    if(!req.session.user){
       return res.json({status:"Access denied",msg:"Please login to your account"})
    }
    next();

}
exports.isAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    jwt.verify(authHeader, process.env.SECREATE, (err, user) => {
        if (err) {
            return res.status(403).json({ status: "FAILURE", message: "Your are not authorized" });
        }
            next();

    });
}