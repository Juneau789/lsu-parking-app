const cheerio = require("cheerio");
const axios = require("axios");
const mongoose = require("mongoose");
const ParkingLot = require("../models/ParkingLot");

const URL = "https://www.lsu.edu/parking/availability.php";

mongoose
  .connect("mongodb+srv://ilarse1:zuY4HxtS3gxlWMoe@lsu-parking-app-hi.1avnk.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

const scrapeData = async () => {
  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

    // Clear existing data
    await ParkingLot.deleteMany({});
    console.log("Cleared existing parking lot data");

    const parkingLots = [];

    // Scrape data
    $(".accordion-section-2").each((_, section) => {
      const permitType = $(section).prev("h2").text().trim();

      $(section)
        .find(".card")
        .each((_, card) => {
          const day = $(card).find("button").text().trim();

          $(card)
            .find("tbody tr")
            .each((index, row) => {
              if (index === 0) return;

              const cells = $(row).find("td");
              const lotName = $(cells[0]).text().trim();
              const lotNumber = $(cells[1]).text().trim();
              const totalSpaces = parseInt($(cells[2]).text().trim(), 10);
              const availability = {
                "7:00 am": $(cells[3]).text().trim(),
                "11:00 am": $(cells[4]).text().trim(),
                "2:00 pm": $(cells[5]).text().trim(),
                "4:00 pm": $(cells[6]).text().trim(),
              };

              if (lotName && lotNumber && !isNaN(totalSpaces)) {
                parkingLots.push({
                  permitType,
                  day,
                  lotName,
                  lotNumber,
                  totalSpaces,
                  availability,
                });
              }
            });
        });
    });

    // Insert data into MongoDB
    if (parkingLots.length > 0) {
      await ParkingLot.insertMany(parkingLots);
      console.log(`Successfully saved ${parkingLots.length} parking lot records.`);
    } else {
      console.log("No data to save.");
    }
  } catch (error) {
    console.error("Error scraping or saving data:", error);
  } finally {
    mongoose.connection.close();
  }
};

scrapeData();
