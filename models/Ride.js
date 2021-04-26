const mongoose = require("mongoose");

// Create Schema

//need to change user_id type to id
const RideSchema = new mongoose.Schema({
    rider_id: {
      type: String,
      required: true
    },
    from: {
      type: String,
      required: true
    },
    to: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    passenger: {
      type: Number,
      default: 0
    },
    passenger_left: {
      type: Number,
      default: 0


    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      default: "unbooked"
    }
  },

);

Ride = mongoose.model("rides", RideSchema);

module.exports = Ride