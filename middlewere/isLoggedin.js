module.exports =(req,res,next)=>{
    if(!req.session.user){
       return res.json({status:"Access denied",msg:"Please login to your account"})
    }
    next();

}