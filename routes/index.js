// routes/index.js
const express = require('express');
const router = express.Router();
const ParkingLot = require('../models/ParkingLot');

// Availability Page
router.get('/availability', async (req, res) => {
  const parkingLots = await ParkingLot.find();
  res.render('pages/availability', { parkingLots });
});

// Admin Page
router.get('/admin', (req, res) => {
  res.render('pages/admin');
});

module.exports = router;
