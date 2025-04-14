// Extract the listing_id from the URL path
const pathSegments = window.location.pathname.split("/");
const listingId = pathSegments[pathSegments.length - 1];

// Set the listing_id in the hidden input field
if (listingId) {
    document.getElementById("listing_id").value = listingId;
}

// Implement booking form
document
    .getElementById("bookingForm")
    .addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        data.client = {
            name: formData.get("client[name]"),
            email_address: formData.get("client[email_address]"),
            mobile_phone: formData.get("client[mobile_phone]"),
            postal_address: formData.get("client[postal_address]"),
            home_address: formData.get("client[home_address]"),
        };

        try {
            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.success) {
                // Redirect to confirmation page with booking details
                const confirmationUrl = `/confirmation.html?booking_id=${
                    result.booking_id
                }&property_name=${encodeURIComponent(
                    result.property_name
                )}&arrival_date=${data.arrival_date}&departure_date=${
                    data.departure_date
                }&client_name=${data.client.name}`;
                window.location.href = confirmationUrl; // Redirect to confirmation page
            } else {
                alert("Failed to create booking: " + result.message);
            }
        } catch (error) {
            console.error("Error submitting form", error);
            alert("An error occurred while creating the booking");
        }
    });


