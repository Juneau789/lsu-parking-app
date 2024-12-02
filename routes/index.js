// routes/index.js
const express = require('express');
const router = express.Router();
const ParkingLot = require('../models/ParkingLot');

// Availability Page
router.get('/availability', async (req, res) => {
  try {
    const parkingLots = await ParkingLot.find();
    res.render('pages/availability', { parkingLots });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Admin Page
router.get('/admin', async (req, res) => {
  try {
    const parkingLots = await ParkingLot.find(); // Fetch parking lots
    res.render('pages/admin', { parkingLots });  // Pass parkingLots to the view
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
