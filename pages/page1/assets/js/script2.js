// Ticket Popup Logic
function showTicketPopup(customerDetails, selectedSeats, totalAmount) {
    const currentDateTime = new Date().toLocaleString();
    const seatDetails = selectedSeats.join(", ");

    // Remove any existing popup to avoid duplicates
    let overlayContainer = document.getElementById('ticket-popup-container');
    if (overlayContainer) {
        overlayContainer.remove();
    }

    // Create the overlay container
    overlayContainer = document.createElement('div');
    overlayContainer.id = 'ticket-popup-container';
    overlayContainer.classList.add('popup-overlay');

    // Create the popup container
    const popupContainer = document.createElement('div');
    popupContainer.id = 'ticket-popup';
    popupContainer.classList.add('ticket-popup');

    // Ticket Details
    popupContainer.innerHTML = `
        <h2>Your Booking Ticket</h2>
        <p><strong>Name:</strong> ${customerDetails.name}</p>
        <p><strong>Email:</strong> ${customerDetails.email}</p>
        <p><strong>Contact Number:</strong> ${customerDetails.number}</p>
        <p><strong>Date & Time:</strong> ${currentDateTime}</p>
        <p><strong>Seats Reserved:</strong> ${seatDetails}</p>
        <p><strong>Total Amount Paid:</strong> ${totalAmount}</p>
        <button id="close-popup">Close</button>
    `;

    // Append the popup to the overlay container
    overlayContainer.appendChild(popupContainer);

    // Append the overlay to the body
    document.body.appendChild(overlayContainer);

    // Close button functionality
    document.getElementById('close-popup').addEventListener('click', function () {
        overlayContainer.remove(); // Proper closure only via button click
    });
}

function showCustomerForm(selectedSeats, totalAmount) {
    // Remove any existing form popup
    let overlayContainer = document.getElementById('customer-form-popup');
    if (overlayContainer) {
        overlayContainer.remove();
    }

    overlayContainer = document.createElement('div');
    overlayContainer.id = 'customer-form-popup';
    overlayContainer.classList.add('popup-overlay');

    const formContainer = document.createElement('div');
    formContainer.classList.add('ticket-popup');

    formContainer.innerHTML = `
        <h2>Customer Information</h2>
        <form id="customer-form">
            <label for="customer-name">Name:</label>
            <input type="text" id="customer-name" name="name" required>
            <label for="customer-email">Email:</label>
            <input type="email" id="customer-email" name="email" required>
            <label for="customer-number">Contact Number:</label>
            <input type="tel" id="customer-number" name="number" required>
            <button type="submit">Submit</button>
        </form>
    `;

    overlayContainer.appendChild(formContainer);
    document.body.appendChild(overlayContainer);

    document.getElementById('customer-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('customer-name').value;
        const email = document.getElementById('customer-email').value;
        const number = document.getElementById('customer-number').value;
        overlayContainer.remove(); // Close only after submission
        showTicketPopup({ name, email, number }, selectedSeats, totalAmount);
    });
}

// Integration with Seat Selection Checkout
function handleCheckout(selectedSeats, totalAmount) {
    if (selectedSeats.length === 0) {
        alert("Please select at least one seat.");
        return;
    }
    showCustomerForm(selectedSeats, totalAmount);
}

// Example Usage
document.getElementById('checkout-button').addEventListener('click', function () {
    const selectedSeatElements = document.querySelectorAll('#selected-seats li');
    const selectedSeats = Array.from(selectedSeatElements).map(seat => seat.id.replace("cart-item-", ""));
    const totalAmount = parseFloat(document.getElementById('total').innerText);
    handleCheckout(selectedSeats, totalAmount);
});
