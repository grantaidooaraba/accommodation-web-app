const container = document.getElementById("listings-container");
const locationInput = document.getElementById("locationFilter");
const maxPriceInput = document.getElementById("maxPrice");
const boreholeSelect = document.getElementById("boreholeFilter");
const applyBtn = document.getElementById("applyFilters");
const resetBtn = document.getElementById("resetFilters");

let listingsData = [];
let userLat = null;
let userLng = null;

// Get user location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    position => {
      userLat = position.coords.latitude;
      userLng = position.coords.longitude;
      console.log("User location:", userLat, userLng);
    },
    err => console.warn("Location access denied")
  );
}

// Fetch listings from backend
fetch("http://localhost:5000/listings")
  .then(res => res.json())
  .then(data => {
    listingsData = data.map(listing => ({
      ...listing,
      total_rooms: Number(listing.total_rooms),
      available_rooms: Number(listing.available_rooms),
      spots_needed: Number(listing.spots_needed || 0)
    }));
    displayListings(listingsData);
  })
  .catch(err => {
    container.innerHTML = "<p>Failed to load listings. Make sure the backend is running.</p>";
    console.error(err);
  });

// Helper to calculate distance
function getDistance(lat1, lon1, lat2, lon2) {
  if(!lat1 || !lon1) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI/180;
  const dLon = (lon2 - lon1) * Math.PI/180;
  const a = 
    0.5 - Math.cos(dLat)/2 + 
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * 
    (1 - Math.cos(dLon))/2;
  return R * 2 * Math.asin(Math.sqrt(a)).toFixed(2);
}

// Display listings
function displayListings(data) {
  container.innerHTML = "";
  if (data.length === 0) {
    container.innerHTML = "<p>No listings found.</p>";
    return;
  }

  // Sort by distance if user location available
  if(userLat && userLng) {
    data.sort((a,b) => {
      const dA = getDistance(userLat,userLng,a.latitude,a.longitude) || Infinity;
      const dB = getDistance(userLat,userLng,b.latitude,b.longitude) || Infinity;
      return dA - dB;
    });
  }

  data.forEach(listing => {
    const totalRooms = listing.total_rooms;
    const availableRooms = listing.available_rooms;
    const filledRooms = totalRooms - availableRooms;

    const occupancyClass = availableRooms > 0 ? "badge-available" : "badge-full";
    const occupancyText = availableRooms > 0 ? `${availableRooms} spots available` : "Full";

    let roommateText = "";
    if(listing.roommate_sharing && listing.spots_needed > 0) {
      roommateText = `
        <p class="roommate-info">Looking for ${listing.spots_needed} more roommate(s)</p>
        <button class="interest-btn" onclick="alert('Contact: ${listing.contact}')">I'm interested</button>
      `;
    }

    const distanceText = (userLat && userLng && listing.latitude && listing.longitude) ?
      `<p><strong>Distance:</strong> ${getDistance(userLat,userLng,listing.latitude,listing.longitude)} km</p>` : "";

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>${listing.name}</h2>
      <p><strong>Price:</strong> $${listing.price}</p>
      <p><strong>Location:</strong> ${listing.location}</p>
      <p><strong>Borehole:</strong> ${listing.borehole ? "Yes" : "No"}</p>
      <p class="occupancy ${occupancyClass}">${occupancyText}</p>
      <p><strong>Occupied:</strong> ${filledRooms}</p>
      ${roommateText}
      ${distanceText}
      <p><strong>Contact:</strong> ${listing.contact}</p>
    `;
    container.appendChild(card);
  });
}

// Filters
applyBtn.addEventListener("click", () => {
  let filtered = listingsData;
  const location = locationInput.value.trim().toLowerCase();
  const maxPrice = parseFloat(maxPriceInput.value);
  const borehole = boreholeSelect.value;

  if (location) filtered = filtered.filter(l => l.location.toLowerCase().includes(location));
  if (!isNaN(maxPrice)) filtered = filtered.filter(l => l.price <= maxPrice);
  if (borehole) filtered = filtered.filter(l => l.borehole.toString() === borehole);

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
