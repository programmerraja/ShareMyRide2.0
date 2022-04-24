const mongoose = require("mongoose");


// Create Schema

//need to change user_id type to id
const UserSchema = new mongoose.Schema({
    name: {
      type: String
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    whatsappno: {
      type: Number,
      required: true
    },
    adharNo:{
      type: Number,
      required: true
    },
    isVerified:{
      type:Boolean,
      required:true,
      default:false
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: true
    },
    profile: {
      type: String
    },
    rides_booked: {
      type: Number,
      default: 0
    },
    created_at: {
      type: Date,
      default: new Date()
    },
    password_reset_token: {
      type: String
    },
    password_reset_expires: {
      type: Date
    }
  },

);

User = mongoose.model("user", UserSchema);

module.exports = User