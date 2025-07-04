function isDateRangeOverlap(start1, end1, start2, end2) {
  return !(end1 < start2 || start1 > end2);
}

document.addEventListener("DOMContentLoaded", () => {
  const amsterdam = window.amsterdam;
  const listingId = new URLSearchParams(window.location.search).get("id");

  const listing = amsterdam.find(ap => ap.listing_id === listingId);
  const detailsEl = document.getElementById("listing-details");
  const messageEl = document.getElementById("booking-message");

  if (!listing) {
    detailsEl.innerHTML = "<p style='color:red;'>Apartment not found.</p>";
    return;
  }

  detailsEl.innerHTML = `
    <h1>${listing.name}</h1>
    <img src="${listing.picture_url}" alt="${listing.name}" />
    <p>${listing.description}</p>
    <p><strong>Neighborhood:</strong> ${listing.neighborhood_overview || "N/A"}</p>
  `;

  const form = document.getElementById("booking-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const creditCard = document.getElementById("creditCard").value.trim();
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    const start = new Date(startDate);
    const end = new Date(endDate);

    messageEl.className = ""; // Reset previous classes

    if (!startDate || !endDate || isNaN(start) || isNaN(end) || start >= end) {
      messageEl.textContent = "Invalid date range.";
      messageEl.classList.add("error");
      return;
    }

    if (!checkAvailability(listingId, startDate, endDate)) {
      messageEl.textContent = "Selected dates are not available.";
      messageEl.classList.add("error");
      return;
    }

    const username = loadFromStorage("currentUser");
    if (!username) {
      messageEl.textContent = "You must be logged in to book.";
      messageEl.classList.add("error");
      return;
    }

    const bookingKey = `${username}_bookings`;
    const bookings = loadFromStorage(bookingKey) || [];

    bookings.push({ listingId, startDate, endDate });
    saveToStorage(bookingKey, bookings);

    messageEl.textContent = "Booking confirmed!";
    messageEl.classList.add("success");
    form.reset();
  });
});

function checkAvailability(listingId, startDate, endDate) {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.endsWith("_bookings")) {
      const bookings = loadFromStorage(key) || [];
      for (const booking of bookings) {
        if (
          booking.listingId === listingId &&
          isDateRangeOverlap(startDate, endDate, booking.startDate, booking.endDate)
        ) {
          return false;
        }
      }
    }
  }
  return true;
}
