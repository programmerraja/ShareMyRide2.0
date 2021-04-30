const mongoose = require("mongoose");

// Create Schema
//need to change user_id type to id
const BookingSchema = new mongoose.Schema({
    user_id: {
      type: String,
      required: true
    },
    rider_id: {
      type: String,
      required: true
    },
    review: {
      type: String
    },
    rating: {
      type: Number
    }
  },

);

Booking = mongoose.model("review", BookingSchema);

module.exports = Booking