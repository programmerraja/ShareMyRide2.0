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
    is_email_verified: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: true
    },
    profile: {
      type: String,
      default: "/public/img/user.svg"
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