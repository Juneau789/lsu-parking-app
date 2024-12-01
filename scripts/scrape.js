const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const ParkingLot = require('../models/ParkingLot');

(async function scrape() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/lsu_parking', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Fetch the LSU parking page
    const { data } = await axios.get('https://www.lsu.edu/parking/availability.php');
    const $ = cheerio.load(data);

    // Clear existing data
    await ParkingLot.deleteMany({});
    console.log('Cleared existing parking lot data');

    // Parse data
    const parkingData = [];

    $('.permit-section').each((index, section) => {
      const permitType = $(section).find('h2').text().trim();

      $(section).find('.day-section').each((dayIndex, daySection) => {
        const day = $(daySection).find('h3').text().trim();

        $(daySection).find('tr').each((rowIndex, row) => {
          if (rowIndex === 0) return; // Skip header row

          const name = $(row).find('td:nth-child(1)').text().trim();
          const lotId = $(row).find('td:nth-child(2)').text().trim();
          const totalSpaces = parseInt($(row).find('td:nth-child(3)').text().trim(), 10);

          const availability = {
            "7:00 am": $(row).find('td:nth-child(4)').text().trim(),
            "11:00 am": $(row).find('td:nth-child(5)').text().trim(),
            "2:00 pm": $(row).find('td:nth-child(6)').text().trim(),
            "4:00 pm": $(row).find('td:nth-child(7)').text().trim(),
          };

          if (!name || !lotId || isNaN(totalSpaces)) {
            console.warn(`Skipping invalid row: Name="${name}", Lot ID="${lotId}", Total Spaces="${totalSpaces}"`);
            return;
          }

          // Check if the lot already exists in parkingData
          let lot = parkingData.find(l => l.name === name && l.lotId === lotId);
          if (!lot) {
            lot = { name, lotId, totalSpaces, availability: {} };
            parkingData.push(lot);
          }

          // Add availability for the day
          lot.availability[day] = availability;
        });
      });
    });

    // Save data to MongoDB
    if (parkingData.length > 0) {
      await ParkingLot.insertMany(parkingData);
      console.log(`Successfully saved ${parkingData.length} parking lot entries.`);
    } else {
      console.warn('No valid parking data found to save.');
    }

    process.exit(0); // Exit the script
  } catch (error) {
    console.error('Error during scraping:', error);
    process.exit(1); // Exit with an error code
  }
})();
