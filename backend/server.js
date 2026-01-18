const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const PORT = 5000; //change if 5000 conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Load listings from JSON
let listings = JSON.parse(fs.readFileSync("./data/listings.json"));

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Accommodation Finder Backend!");
});

// Get all listings
app.get("/listings", (req, res) => {
  res.json(listings);
});

// Get single listing by ID
app.get("/listings/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const listing = listings.find(l => l.id === id);
  if (listing) {
    res.json(listing);
  } else {
    res.status(404).json({ message: "Listing not found" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
