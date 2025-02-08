var firstSeatLabel = 1;
var bookedSeats = {
    bus1: JSON.parse(localStorage.getItem('bookedBus1') || '[]'),
    bus2: JSON.parse(localStorage.getItem('bookedBus2') || '[]'),
    bus3: JSON.parse(localStorage.getItem('bookedBus3') || '[]')
};
var currentBus = 'bus1';

$(document).ready(function () {
    function initializeSeatMap(bus) {
        firstSeatLabel = 1;
        $('#bus-seat-map').empty();
        var $cart = $('#selected-seats'),
            $counter = $('#counter'),
            $total = $('#total');
        
        var sc = $('#bus-seat-map').seatCharts({
            map: [
                'ff_ff',
                'ff_ff',
                'ee_ee',
                'ee_ee',
                'ee___',
                'ee_ee',
                'ee_ee',
                'ee_ee',
                'eeeee',
            ],
            seats: {
                f: {
                    price: 950,
                    classes: 'first-class',
                    category: 'First Class'
                },
                e: {
                    price: 700,
                    classes: 'economy-class',
                    category: 'Economy Class'
                }
            },
            naming: {
                top: false,
                getLabel: function () {
                    return firstSeatLabel++;
                }
            },
            legend: {
                node: $('#legend'),
                items: [
                    ['f', 'available', 'First Class'],
                    ['e', 'available', 'Economy Class'],
                    ['f', 'unavailable', 'Already Booked']
                ]
            },
            click: function () {
                if (this.status() == 'available') {
                    $('<li>' + this.data().category + ' Seat # ' + this.settings.label + ': <b>₱' + this.data().price + '</b> <a href="#" class="cancel-cart-item">[cancel]</a></li>')
                        .attr('id', 'cart-item-' + this.settings.id)
                        .data('seatId', this.settings.id)
                        .appendTo($cart);

                    $counter.text(sc.find('selected').length + 1);
                    $total.text(recalculateTotal(sc) + this.data().price);
                    return 'selected';
                } else if (this.status() == 'selected') {
                    $counter.text(sc.find('selected').length - 1);
                    $total.text(recalculateTotal(sc) - this.data().price);
                    $('#cart-item-' + this.settings.id).remove();
                    return 'available';
                } else if (this.status() == 'unavailable') {
                    return 'unavailable';
                } else {
                    return this.style();
                }
            }
        });

        sc.get(bookedSeats[bus]).status('unavailable');
    }

    initializeSeatMap(currentBus);

    $('.bus-selector').click(function () {
        currentBus = $(this).data('bus');
        initializeSeatMap(currentBus);
    });

    $('#selected-seats').on('click', '.cancel-cart-item', function () {
        var seatId = $(this).parents('li:first').data('seatId');
        $('#bus-seat-map').seatCharts().get(seatId).click();
    });

    $('#checkout-button').click(function () {
        var items = $('#selected-seats li');
        if (items.length <= 0) {
            alert("Please select at least 1 seat first.");
            return false;
        }
        var selected = [];
        items.each(function () {
            var id = $(this).attr('id').replace("cart-item-", "");
            selected.push(id);
        });
        bookedSeats[currentBus] = bookedSeats[currentBus].concat(selected);
        localStorage.setItem('booked' + currentBus.charAt(0).toUpperCase() + currentBus.slice(1), JSON.stringify(bookedSeats[currentBus]));

        // Show customer information form first
        showCustomerForm(selected, recalculateTotal($('#bus-seat-map').seatCharts()));
    });

    $('#reset-btn').click(function () {
        if (confirm("Are you sure to reset the reservation for this bus?")) {
            bookedSeats[currentBus] = [];
            localStorage.setItem('booked' + currentBus.charAt(0).toUpperCase() + currentBus.slice(1), JSON.stringify([]));
            alert("Seats have been reset successfully.");
            location.reload();
        }
    });

    function recalculateTotal(sc) {
        var total = 0;
        sc.find('selected').each(function () {
            total += this.data().price;
        });
        return total;
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

            overlayContainer.remove(); // Close the customer form popup
            showPaymentPopup(name, email, number, selectedSeats, totalAmount);
        });
    }

    function showPaymentPopup(name, email, number, selectedSeats, totalAmount) {
        // Create the payment steps popup
        let paymentOverlay = document.createElement('div');
        paymentOverlay.id = 'payment-steps-popup';
        paymentOverlay.classList.add('popup-overlay');

        const paymentContainer = document.createElement('div');
        paymentContainer.classList.add('payment-popup');

        paymentContainer.innerHTML = `
            <h2>Payment Process</h2>
            <ol>
                <li>Step 1: Choose payment method</li>
                <li>Step 2: Enter payment details</li>
                <li>Step 3: Receive booking confirmation</li>
            </ol>
            <label for="payment-method">Payment Method:</label>
            <select id="payment-method">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
            </select>
            <div id="card-details" style="display:none;">
                <label for="card-number">Card Number:</label>
                <input type="text" id="card-number" placeholder="XXXX XXXX XXXX XXXX" required>
                <label for="expiration-date">Expiration Date:</label>
                <input type="month" id="expiration-date" required>
                <label for="cvc">CVC:</label>
                <input type="text" id="cvc" placeholder="XXX" required>
            </div>
            <p id="payment-info"></p>
            <button id="confirm-payment-btn">Confirm Payment</button>
        `;

        paymentOverlay.appendChild(paymentContainer);
        document.body.appendChild(paymentOverlay);

        document.getElementById('payment-method').addEventListener('change', function () {
            const method = this.value;
            if (method === 'cash') {
                document.getElementById('card-details').style.display = 'none';
                document.getElementById('payment-info').textContent = 'You can pay in cash at the counter 1-2 hours before your departure time.';
            } else {
                document.getElementById('card-details').style.display = 'block';
                document.getElementById('payment-info').textContent = '';
            }
        });

        document.getElementById('confirm-payment-btn').addEventListener('click', function () {
            const method = document.getElementById('payment-method').value;

            if (method === 'card') {
                const cardNumber = document.getElementById('card-number').value;
                const expirationDate = document.getElementById('expiration-date').value;
                const cvc = document.getElementById('cvc').value;

                // Validate card details (simple check for illustration)
                if (!cardNumber || !expirationDate || !cvc) {
                    alert('Please enter valid card details.');
                    return;
                }
            }

            // Remove payment popup
            paymentOverlay.remove();
            
            // Mark seats as unavailable
            markSeatsAsUnavailable(selectedSeats);
            
            // Show the booking confirmation ticket
            showTicketPopup({ name, email, number }, selectedSeats, totalAmount);
            alert('Payment confirmed. Booking is complete!');
        });
    }

    function markSeatsAsUnavailable(selectedSeats) {
        var sc = $('#bus-seat-map').seatCharts();
        selectedSeats.forEach(function (seatId) {
            sc.get(seatId).status('unavailable');
        });
    }

    function showTicketPopup(customerInfo, selectedSeats, totalAmount) {
        let ticketOverlay = document.createElement('div');
        ticketOverlay.id = 'ticket-popup';
        ticketOverlay.classList.add('popup-overlay');

        const ticketContainer = document.createElement('div');
        ticketContainer.classList.add('ticket-popup');

        ticketContainer.innerHTML = `
            <h2>Your Booking Confirmation</h2>
            <p>Customer Name: ${customerInfo.name}</p>
            <p>Email: ${customerInfo.email}</p>
            <p>Contact Number: ${customerInfo.number}</p>
            <p>Seats Booked: ${selectedSeats.join(', ')}</p>
            <p>Total Amount: ₱${totalAmount}</p>
            <button id="close-ticket-popup">Close</button>
        `;

        ticketOverlay.appendChild(ticketContainer);
        document.body.appendChild(ticketOverlay);

        document.getElementById('close-ticket-popup').addEventListener('click', function () {
            ticketOverlay.remove();
        });
    }
});
