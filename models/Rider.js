//Todo 
//add no of rides 
const mongoose = require("mongoose");
// Create Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String
  },
  gender: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  is_email_verified: {
    type: Boolean,
    default: false
  },
  is_admin: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: true
  },
  date_of_birth: {
    type: Date,
    required: true
  },
  phoneno: {
    type: Number,
  },
  whatsappno: {
    type: Number
  },
  drivingexpereince: {
    type: String,
    required: true
  },
  profile:{
    type:String,
  },
  licenseno: {
    type: String,
    required: true
  },
  bio: {
    type: String
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
});

User = mongoose.model("Rider", UserSchema);
module.exports = User