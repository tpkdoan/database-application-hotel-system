// Extracting the booking ID and property name from the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const bookingId = urlParams.get("booking_id");
const propertyName = urlParams.get("property_name");

if (bookingId && propertyName) {
    document.getElementById(
        "confirmation-message"
    ).textContent = `Here are your details for your stay at the "${propertyName}"!`;

    // Display booking details
    const bookingDetails = `
                <p>Booking ID: ${bookingId}</p>
                <p>Name: ${urlParams.get("client_name")}</p>
                <p>Check-in Date: ${urlParams.get("arrival_date")}</p>
                <p>Check-out Date: ${urlParams.get("departure_date")}</p>
            `;
    document.getElementById("booking-details").innerHTML = bookingDetails;
} else {
    document.getElementById("confirmation-message").textContent =
        "Booking details are missing.";
}
