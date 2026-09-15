/* =========================================
   CLIENT BOOKINGS
========================================= */

async function loadClientBookings() {

    const email =
        getClientEmail();


    const client =
        document.getElementById("currentUser").value;


    document.getElementById("clientName").textContent =
        client;


    document.getElementById("clientAvatar").textContent =
        client.charAt(0).toUpperCase();


    const container =
        document.getElementById("clientBookings");


    /*
       The user selector represents the demo client.
       Each demo user has a predictable email.
    */

    try {

        const bookings = await api(
            `/api/bookings/client/${encodeURIComponent(email)}`
        );


        if (bookings.length === 0) {

            container.innerHTML = `
                <div class="empty-state">

                    <strong>
                        No bookings yet
                    </strong>

                    Head to the marketplace
                    and find someone to create with.

                    <br><br>

                    <button
                        class="primary-button"
                        onclick="showPage('marketplace')"
                    >
                        Browse gigs
                    </button>

                </div>
            `;

            return;
        }


        container.innerHTML = bookings
            .map(createClientBooking)
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
   DEMO EMAIL
========================================= */

function getClientEmail() {

    const user =
        document.getElementById("currentUser").value;

    return `${user.toLowerCase()}@creatorhub.demo`;
}


/* =========================================
   CLIENT BOOKING CARD
========================================= */

function createClientBooking(booking) {

    let action = "";


    if (booking.status === "Declined") {

        action = `
            <button
                class="book-button"
                onclick="showPage('marketplace')"
            >
                Find another gig →
            </button>
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
                    Creator:
                    <strong>
                        ${escapeHTML(booking.creator_name)}
                    </strong>
                </p>

                ${
                    booking.message
                        ? `
                            <div class="booking-message">
                                Your message:
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

                ${action}

            </div>

        </article>
    `;
}
