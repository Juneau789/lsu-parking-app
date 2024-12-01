const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lotId: { type: String, required: true }, // Stores the Lot ID
  totalSpaces: { type: Number, required: true },
  availability: {
    type: Map,
    of: Map, // Nested map for day -> time slot -> percentage full
  },
});

module.exports = mongoose.model('ParkingLot', parkingLotSchema);
