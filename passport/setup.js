const bcrypt = require("bcryptjs");
const Rider = require("../models/Rider");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    Rider.findById(id, (err, rider) => {
        //if he is rider 
        if(rider){
            done(err, rider);
        }
        //if he is user
        else{
            User.findById(id,(err,user)=>{
                done(err,user);
            })
        }
    });
});

// Local Strategy
passport.use(new LocalStrategy({ usernameField: "email" },AuthUser));

async function AuthUser(email, password, done)
{
        console.log(email,password)
        try{
            //first checking he is rider
            let rider= await Rider.findOne({email:email});
            if (rider) {
                let hash=rider.password;   
                 if(bcrypt.compareSync(password,hash)){
                        return done(null, rider);
                }
                else{
                     return done(null, false, { message: "Password does not match"});  
                }
             }

             
             //if he not rider checking he is user
             let user=await User.findOne({email:email});
             if(user){
                let hash=user.password;   
                 if(bcrypt.compareSync(password,hash)){
                        return done(null, user);
                }
                else{
                     return done(null, false, { message: "Password does not match"});  
                }
             }
             //if user is null
             else if(!user){
                 return done(null, false, { message: "No User exit" });   
             }
             //if user is not null mean the rider is null
             else{
                 return done(null, false, { message: "No Rider exit" });   
             }
            }
        catch (e){
            return done(e);
        }
}
module.exports = passport;