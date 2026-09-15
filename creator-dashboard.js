/* =========================================
   CREATOR DASHBOARD
========================================= */

async function loadCreatorDashboard() {

    const creator =
        document.getElementById("currentUser").value;


    document.getElementById("dashboardCreator").textContent =
        creator;


    const container =
        document.getElementById("creatorBookings");


    try {

        const bookings = await api(
            `/api/bookings/creator/${encodeURIComponent(creator)}`
        );


        const pending =
            bookings.filter(
                booking => booking.status === "Pending"
            ).length;


        const accepted =
            bookings.filter(
                booking => booking.status === "Accepted"
            ).length;


        document.getElementById("pendingCount").textContent =
            pending;

        document.getElementById("acceptedCount").textContent =
            accepted;

        document.getElementById("totalCreatorBookings").textContent =
            bookings.length;


        if (bookings.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <strong>No booking requests yet</strong>
                    When clients book your gigs,
                    their requests will appear here.
                </div>
            `;

            return;
        }


        container.innerHTML = bookings
            .map(booking => createCreatorBooking(booking))
            .join("");


    } catch (error) {

        container.innerHTML = `
            <div class="empty-state">
                ${error.message}
            </div>
        `;
    }
}


/* =========================================
   CREATOR BOOKING CARD
========================================= */

function createCreatorBooking(booking) {

    let actions = "";


    if (booking.status === "Pending") {

        actions = `
            <div class="booking-actions">

                <button
                    class="accept-button"
                    onclick="updateBooking(${booking.id}, 'accept')"
                >
                    Accept
                </button>

                <button
                    class="decline-button"
                    onclick="updateBooking(${booking.id}, 'decline')"
                >
                    Decline
                </button>

            </div>
        `;
    }


    return `
        <article class="booking-card">

            <div class="booking-main">

                <span class="gig-category">
                    ${escapeHTML(booking.category)}
                </span>

                <h3>
                    ${escapeHTML(booking.title)}
                </h3>

                <p>
                    Client:
                    <strong>
                        ${escapeHTML(booking.client_name)}
                    </strong>
                    ·
                    ${escapeHTML(booking.client_email)}
                </p>

                ${
                    booking.message
                        ? `
                            <div class="booking-message">
                                "${escapeHTML(booking.message)}"
                            </div>
                        `
                        : ""
                }

            </div>


            <div class="booking-side">

                <span class="status ${booking.status}">
                    ${booking.status}
                </span>

                <strong>
                    $${booking.rate}
                </strong>

                ${actions}

            </div>

        </article>
    `;
}


/* =========================================
   ACCEPT / DECLINE
========================================= */

async function updateBooking(id, action) {

    const word =
        action === "accept"
            ? "accept"
            : "decline";


    const confirmed =
        confirm(`Are you sure you want to ${word} this booking?`);


    if (!confirmed) {
        return;
    }


    try {

        await api(`/api/bookings/${id}/${action}`, {
            method: "PATCH"
        });


        if (action === "accept") {

            showToast(
                "Booking accepted! ✦"
            );

        } else {

            showToast(
                "Booking declined."
            );
        }


        loadCreatorDashboard();

        loadClientBookings();

        loadGigs();


    } catch (error) {

        showToast(error.message);
    }
}
