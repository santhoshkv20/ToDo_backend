const nodemailer = require("nodemailer");
require("dotenv").config();

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});
 /**
     * send email to user
     * @param  {string} email email of the user
     * @param  {string} subject email subject
     * @param  {string} body body to be sent in email 
     */
exports.sendMail = async(email,subject,body)=>{
    var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        text: body
    };
   let result = await transporter.sendMail(mailOptions)
   return result
}