//for env
require("dotenv").config();

//node modules
const express=require("express");
const path=require("path");
const bodyParser=require("body-parser");
const session = require('express-session');
const mongoose = require("mongoose");
const MongoStore =require('connect-mongo').default;
const passport = require("./passport/setup");
//middleware
const errorHandler=require("./middleware/errorHandler");
//routers
const signinRiderrouter=require("./routes/signinRider");
const signupRiderrouter=require("./routes/signupRider");

const signinUserrouter=require("./routes/signinUser");
const signupUserrouter=require("./routes/signupUser");

const searchrouter=require("./routes/search");
const riderrouter=require("./routes/rider");
const userrouter=require("./routes/user");
const adminrouter=require("./routes/admin");


const app=new express();
const MONGO_URI =process.env.DBURL;

//db connect
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true ,useUnifiedTopology: true })
    .then(console.log(`MongoDB connected ${MONGO_URI}`))
    .catch(err => console.log(err));

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

//middleware's
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
				  secret: 'asdfghjkwertyuixcvbnmsdfghjkwertyu',
				  resave: false,
				  saveUninitialized: false,
				  cookie: { secure: false },
				  store: MongoStore.create( {mongoUrl:MONGO_URI})
				})
		);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());


// setting value
app.set("view engine" ,"ejs");
app.set("views","./views");

let port=process.env.PORT || 3000;

//routing
app.use("/public",express.static(path.join(__dirname+"/public")));

app.use("/signin/rider",signinRiderrouter);
app.use("/signup/rider",signupRiderrouter);

app.use("/signin/user",signinUserrouter);
app.use("/signup/user",signupUserrouter);

app.use("/signin/",(req,res)=>{
	res.render("signinOptions",{link:"signin"});
});
app.use("/signup/",(req,res)=>{
	res.render("signinOptions",{link:"signup"});
});

app.use("/search",searchrouter);
app.use("/rider",riderrouter);

app.use("/user",userrouter);

app.use("/admin/dashboard/",adminrouter);


app.get("/",(req,res)=>{
	//if he is rider 
	if(req.user){
		if(req.user.licenseno){
			res.render("index",{rider:req.user});
			return
		}
	}
	res.render("index",{user:req.user});

})

//error handler
app.use(errorHandler);

//404 page 
app.get("/*",(req,res)=>{
	res.render("error");
})

process.on("uncaughtException",()=>{
	console.log("uncaughtException")
})

app.listen(port,()=>{console.log("server started")});


	