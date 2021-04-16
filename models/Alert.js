const mongoose = require("mongoose");

// Create Schema
const AlertSchema = new mongoose.Schema({
    user_id: {
      type: String,
      required: true
    },
    from: {
      type: String
    },
    to: {
      type: String
    },
    type: {
      type: String
    },
    date: {
      type: Date
    }
  },

);

Alert = mongoose.model("alert", AlertSchema);

module.exports = Alert