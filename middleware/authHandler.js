
const {AppError}=require("../util/util");

function authUserHandler(req,res,next){
	if(req.user){
		next()
		return
	}
	res.redirect("/signin/user/");
}

function authRiderHandler(req,res,next){
	if(req.user){
		if(req.user.licenseno){
			next()
			return
		}
	}
	res.redirect("/signin/rider/");
}

module.exports={authUserHandler,authRiderHandler};	