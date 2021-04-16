const mongoose = require("mongoose");

// Create Schema
//need to change user_id type to id 
const BookingSchema = new mongoose.Schema({
    user_id: {
      type: String,
      required: true
    },
    ride_id: {
      type: String,
      required: true
    },
    passenger: {
      type: Number,
      default: 0
    }
  },

);

Booking = mongoose.model("booking", BookingSchema);

module.exports = Booking