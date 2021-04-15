const {dbErrorHandler}=require("../util/util");

function errorHandler(err,req,res,next){
	//if not status code set it at internal server problem
	if(!err.status_code){
		err.status_code=500;
	}
	if(process.env.NODE_ENV==="PRODUCTION"){
		let error_msg=dbErrorHandler(err);
		res.status(err.status_code).json({status:"Failed",error_msg:error_msg});
		return;
	}
	else {
		res.status(err.status_code).json({"msg":err.message,error:err});
	}
}
// if(process.env.NODE_ENV==="DEVELPMENT")
module.exports=errorHandler;