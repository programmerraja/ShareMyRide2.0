
const Ride = require("../models/Ride");
const Rider = require("../models/Rider");

async function post(req,res){
	if(req.body){

		 let {from,to,type,date}=req.body;
		 type=type.toLowerCase();
		 from=from.toLowerCase();
		 to=to.toLowerCase();
		 let rides= await Ride.find({from:from,to:to,date:{"$gte":date},type:type});	
		 if(req.user){
		 	//if he is rider pass rider option 
		 	if(req.user.licenseno){
		 		res.render("searchResult",{rides,search:{from,to,type,date},rider:req.user});
		 		return
		 	}
		 }	
		 res.render("searchResult",{rides,search:{from,to,type,date},user:req.user});

	}
	//say rider to enter the search options
}


async function getSpecificRide(req,res) {
	if(req.params.id){
		let id=req.params.id;
		 let ride= await Ride.findOne({_id:id});
		 if(ride){
		 	owner=await Rider.findOne({_id:ride.rider_id});
		 	if(req.user){
			 	//if he is rider pass rider option 
			 	if(req.user.licenseno){
			 		res.render("vehicleDetail",{ride,owner:{id:owner._id,name:owner.name},rider:req.user})
			 		return
			 	}
			}
			res.render("vehicleDetail",{ride,owner:{id:owner._id,name:owner.name},user:req.user})

		 }
		 res.render("error");
	}

	
	
}  
module.exports={
					post,
					getSpecificRide	
				};	