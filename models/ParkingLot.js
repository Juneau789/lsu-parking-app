const mongoose = require("mongoose");

const parkingLotSchema = new mongoose.Schema({
  permitType: { type: String },
  day: { type: String },
  lotName: { type: String },
  lotNumber: { type: String },
  totalSpaces: { type: Number },
  availability: {
    "7:00 am": { type: String },
    "11:00 am": { type: String },
    "2:00 pm": { type: String },
    "4:00 pm": { type: String },
  },
});

// Explicitly specify collection name to avoid pluralization issues
module.exports = mongoose.model("ParkingLot", parkingLotSchema, "parkinglots");