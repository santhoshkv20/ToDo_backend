module.exports =(req,res,next)=>{
    if(!req.session.user){
       return res.json("Your not authorized")
    }
    next();

}