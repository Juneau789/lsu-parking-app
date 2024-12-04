// routes/index.js
const express = require('express');
const router = express.Router();
const ParkingLot = require('../models/ParkingLot');

// Availability Page with Filters
router.get('/availability', async (req, res) => {
  const { permitType, day, lotName } = req.query;

  // Build the query object dynamically based on filters
  const query = {};
  if (permitType) query.permitType = permitType;
  if (day) query.day = day;
  if (lotName) query.lotName = lotName;

  try {
    const parkingLots = await ParkingLot.find(query);

    // Check if results are empty
    const noResults = parkingLots.length === 0;

    res.render('pages/availability', {
      parkingLots,
      noResults,
      permitType: permitType || '', // Pass the current filter value
      day: day || '', // Pass the current filter value
      lotName: lotName || '', // Pass the current filter value
      permitTypes: await ParkingLot.distinct('permitType'),
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], // Static days
      lotNames: await ParkingLot.distinct('lotName'),
    });
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