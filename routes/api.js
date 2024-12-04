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
  try {
    const newLot = new ParkingLot(req.body);
    await newLot.save();
    res.redirect('/availability'); // Redirect to Availability page after adding
  } catch (error) {
    console.error('Error adding parking lot:', error);
    res.status(500).send('Server Error');
  }
});

// Delete a parking lot
router.delete('/parking-lots/:id', async (req, res) => {
  try {
    await ParkingLot.findByIdAndDelete(req.params.id);
    res.redirect('/availability'); // Redirect to Availability page after deletion
  } catch (error) {
    console.error('Error deleting parking lot:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;