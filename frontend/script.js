const container = document.getElementById("listings-container");
const locationInput = document.getElementById("locationFilter");
const maxPriceInput = document.getElementById("maxPrice");
const boreholeSelect = document.getElementById("boreholeFilter");
const applyBtn = document.getElementById("applyFilters");
const resetBtn = document.getElementById("resetFilters");

let listingsData = [];

// Fetch listings from backend
fetch("http://localhost:5000/listings")
  .then(res => res.json())
  .then(data => {
    // Force numbers for total_rooms and available_rooms to prevent NaN
    listingsData = data.map(listing => ({
      ...listing,
      total_rooms: Number(listing.total_rooms),
      available_rooms: Number(listing.available_rooms)
    }));
    displayListings(listingsData);
  })
  .catch(err => {
    container.innerHTML = "<p>Failed to load listings. Make sure the backend is running.</p>";
    console.error(err);
  });

// Function to display listings in cards
function displayListings(data) {
  container.innerHTML = "";
  if (data.length === 0) {
    container.innerHTML = "<p>No listings found.</p>";
    return;
  }

  data.forEach(listing => {
    const totalRooms = listing.total_rooms;
    const availableRooms = listing.available_rooms;
    const filledRooms = totalRooms - availableRooms;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>${listing.name}</h2>
      <p><strong>Price:</strong> $${listing.price}</p>
      <p><strong>Location:</strong> ${listing.location}</p>
      <p><strong>Borehole:</strong> ${listing.borehole ? "Yes" : "No"}</p>
      <p><strong>Available Rooms:</strong> ${availableRooms} / ${totalRooms} (Occupied: ${filledRooms})</p>
      <p><strong>Contact:</strong> ${listing.contact}</p>
    `;
    container.appendChild(card);
  });
}

// Apply filters
applyBtn.addEventListener("click", () => {
  let filtered = listingsData;

  const location = locationInput.value.trim().toLowerCase();
  const maxPrice = parseFloat(maxPriceInput.value);
  const borehole = boreholeSelect.value;

  if (location) {
    filtered = filtered.filter(l => l.location.toLowerCase().includes(location));
  }

  if (!isNaN(maxPrice)) {
    filtered = filtered.filter(l => l.price <= maxPrice);
  }

  if (borehole) {
    filtered = filtered.filter(l => l.borehole.toString() === borehole);
  }

  // Only show listings with available rooms
  filtered = filtered.filter(l => l.available_rooms > 0);

  displayListings(filtered);
});

// Reset filters
resetBtn.addEventListener("click", () => {
  locationInput.value = "";
  maxPriceInput.value = "";
  boreholeSelect.value = "";
  displayListings(listingsData);
});

