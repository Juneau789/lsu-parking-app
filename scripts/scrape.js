const cheerio = require("cheerio");
const axios = require("axios");
const mongoose = require("mongoose");
const ParkingLot = require("../models/ParkingLot");

const URL = "https://www.lsu.edu/parking/availability.php";

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/lsu_parking", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Log connection state
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to database:", mongoose.connection.db.databaseName);
});
mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

const scrapeData = async () => {
  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

    // Clear the existing database entries
    await ParkingLot.deleteMany({});
    console.log("Cleared existing parking lot data");

    // Iterate through each permit section
    $(".accordion-section-2").each((_, section) => {
      const permitType = $(section).prev("h2").text().trim();
      console.log("Processing Permit Type:", permitType);

      $(section)
        .find(".card")
        .each((_, card) => {
          const day = $(card).find("button").text().trim();
          console.log("Processing Day:", day);

          $(card)
            .find("tbody tr")
            .each((index, row) => {
              // Skip the header row
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

              // Log parsed data
              console.log("Parsed Data:", {
                permitType,
                day,
                lotName,
                lotNumber,
                totalSpaces,
                availability,
              });

              // Save the data to MongoDB
              if (lotName && lotNumber && !isNaN(totalSpaces)) {
                const parkingLot = new ParkingLot({
                  permitType,
                  day,
                  lotName,
                  lotNumber,
                  totalSpaces,
                  availability,
                });
                parkingLot
                  .save()
                  .then(() => console.log(`Saved Lot: ${lotName}, Number: ${lotNumber}, for ${day}`))
                  .catch((err) => console.error("Error saving document:", err.errors || err));
              }
            });
        });
    });

    console.log("Successfully saved parking lot data.");
    process.exit();
  } catch (error) {
    console.error("Error scraping data:", error);
    process.exit(1);
  }
};

scrapeData();
