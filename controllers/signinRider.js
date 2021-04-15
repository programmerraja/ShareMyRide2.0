const passport = require("passport");

//handling GET /signin
function getHandler(req,res) {
  if(!req.user){
	 res.render("signin",{link:"rider"});
  }
  else{
    res.redirect("/rider/get/myrides/")
  }
}

function postHandler(req,res,next){
	passport.authenticate('local', function(err, rider, info) {
    if (err) {
     return next(err);
     }
    if (!rider) { 
    	return res.render('signin',{link:"rider",error_msg:info.message});
    	}

    //if rider sucessfully login we need to call manually the login function
    req.logIn(rider, function(err) {
      if (err) { return next(err); }
      return res.redirect('/rider/get/myrides');
    });
  })(req, res, next);	
}


module.exports={getHandler,postHandler};