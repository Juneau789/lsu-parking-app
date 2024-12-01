// routes/api.js
const express = require('express');
const router = express.Router();
const ParkingLot = require('../models/ParkingLot');

// Get all parking lots
router.get('/parking-lots', async (req, res) => {
  const parkingLots = await ParkingLot.find();
  res.json(parkingLots);
});

// Add a new parking lot
router.post('/parking-lots', async (req, res) => {
  const newLot = new ParkingLot(req.body);
  await newLot.save();
  res.json(newLot);
});

// Delete a parking lot
router.delete('/parking-lots/:id', async (req, res) => {
  await ParkingLot.findByIdAndDelete(req.params.id);
  res.json({ message: 'Parking lot deleted' });
});

module.exports = router;
