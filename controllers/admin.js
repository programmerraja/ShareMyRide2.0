//node modules
const passport = require("passport");
//util
const {
    AppError
} = require("../util/util");
//models
const Ride = require("../models/Ride");
const Rider = require("../models/Rider");

//handling GET /signin
function get(req, res) {
        res.render("admin",{user:req.user});

}

async function getRider(req, res) {
    let users = await Rider.find({});
    res.json({
        status: "Sucess",
        users: users
    });
}

async function getRiderById(req, res) {
    if (req.params.id) {
        let id = req.params.id;
        let user = await Rider.findOne({
            _id: id
        });
        res.json({
            status: "Sucess",
            user: user.scammer
        });
    } else {
        res.json({
            status: "Failure",
            error_msg: "Don't be fool!"
        })
    }
}

async function removeRiderById(req, res) {
    if (req.body.user_id) {
        let user_id = req.body.user_id;
        let user = await Rider.deleteOne({
            _id: user_id
        });
        //remove ride also
        // let ride=await deleteMany({ user_id: user_id,});
        if(user){
                res.json({
                    status: "Sucess",
                    error_msg: "sucessfully removed"
                });
        }
    } else {
        res.json({
            status: "Failure",
            error_msg: "Don't be fool!"
        })
    }
}

async function verifiyRiderById(req, res) {
    if (req.body.user_id) {
        let user_id = req.body.user_id;
        let user= await Rider.findOneAndUpdate({_id:user_id},{is_verified:true});
        if(user){
            res.json({
                status: "Sucess",
                error_msg: "sucessfully Verified"
            });
        }
    } else {
        res.json({
            status: "Failure",
            error_msg: "Don't be fool!"
        })
    }
}

module.exports = {
    get,
    getRider,
    getRiderById,
    removeRiderById,
    verifiyRiderById,
};