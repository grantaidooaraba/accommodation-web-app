const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

const listings = require("./data/listings.json");

app.use(cors());
app.use(express.json());

// Endpoint to get all listings
app.get("/listings", (req, res) => {
  // Force numbers to be numeric
  const fixedListings = listings.map(l => ({
    ...l,
    total_rooms: Number(l.total_rooms),
    available_rooms: Number(l.available_rooms),
    spots_needed: Number(l.spots_needed || 0)
  }));
  res.json(fixedListings);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
