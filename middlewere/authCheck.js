const jwt = require("jsonwebtoken");
const { getToken } = require("../Utils/getToken");

exports.isLoggedin = (req, res, next) => {
    if (!req.session.user) {
        return res.json({ status: "Access denied", message: "Please login to your account" })
    }
    next();

}
exports.isAuth = (req, res, next) => {
    const token = getToken(req);
    if (!token) return res.status(403).json({ status: "Access denied", message: "Auth token not passed" })
    jwt.verify(token, process.env.SECREATE, (err, user) => {
        if (err) {
            return res.status(403).json({ status: "Access denied", message: "Your are not authorized" });
        }
        next();

    });
}