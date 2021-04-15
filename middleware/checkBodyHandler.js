

function checkBodyRiderHandler(req,res,next){
	let {name,
		email,
		password,
		date_of_birth,
		gender,
		phoneno,
		whatsappno,
		licenseno,
		drivingexpereince,bio}=req.body;
	if((name && email && password && date_of_birth && gender && phoneno && whatsappno && licenseno && drivingexpereince && bio)){
		res.locals.is_correct=true;
	}
	else{
		res.locals.is_correct=false;
	}	
	next();

}
function checkBodyUserHandler(req,res,next){
	let {name,
		email,
		password,
		whatsappno}=req.body;
	if((name && email && password && whatsappno)){
		res.locals.is_correct=true;
	}
	else{
		res.locals.is_correct=false;
	}	
	next();

}

function checkBodyRideHandler(req,res,next){
	 let {from,to,type,model,passenger,amount,time,date}=req.body
	 if((from && to && type &&  model && amount && time && date)|| (passenger)){
		res.locals.is_correct_ride=true;

	 }
	 else{
		res.locals.is_correct_ride=false;
	 }
	 next();
}

module.exports={checkBodyUserHandler,checkBodyRiderHandler,checkBodyRideHandler};	