/* =========================================
   LOAD GIGS
========================================= */

async function loadGigs() {

    const search =
        document.getElementById("searchInput").value;

    const category =
        document.getElementById("categoryFilter").value;

    const sort =
        document.getElementById("sortFilter").value;


    const params = new URLSearchParams({
        search,
        category,
        sort
    });


    const grid =
        document.getElementById("gigGrid");


    grid.innerHTML = `
        <div class="empty-state">
            Loading gigs...
        </div>
    `;


    try {

        const gigs = await api(
            `/api/gigs?${params.toString()}`
        );


        document.getElementById("gigCount").textContent =
            `${gigs.length} gig${gigs.length !== 1 ? "s" : ""}`;


        if (gigs.length === 0) {

            grid.innerHTML = `
                <div class="empty-state">
                    <strong>No gigs found</strong>
                    Try another search or category.
                </div>
            `;

            return;
        }


        grid.innerHTML = gigs
            .map(gig => createGigCard(gig))
            .join("");

    } catch (error) {

        grid.innerHTML = `
            <div class="empty-state">
                <strong>Couldn't load gigs</strong>
                ${error.message}
            </div>
        `;
    }
}


/* =========================================
   GIG CARD
========================================= */

function createGigCard(gig) {

    const icons = {
        Design: "✦",
        Video: "▶",
        Music: "♫",
        Development: "</>",
        Photography: "◎",
        Writing: "Aa"
    };

    const icon = icons[gig.category] || "✦";


    return `
        <article class="gig-card">

            <div class="gig-image">
                ${icon}
            </div>

            <div class="gig-content">

                <span class="gig-category">
                    ${escapeHTML(gig.category)}
                </span>

                <h3 class="gig-title">
                    ${escapeHTML(gig.title)}
                </h3>

                <p class="gig-description">
                    ${escapeHTML(gig.description)}
                </p>

                <div class="gig-footer">

                    <div>
                        <div class="creator">
                            by ${escapeHTML(gig.creator_name)}
                        </div>

                        <div class="rate">
                            $${gig.rate}
                        </div>
                    </div>

                    <button
                        class="book-button"
                        onclick='openBookingModal(${JSON.stringify(gig)})'
                    >
                        Book →
                    </button>

                </div>

            </div>

        </article>
    `;
}


/* =========================================
   SEARCH EVENTS
========================================= */

let searchTimeout;

document
    .getElementById("searchInput")
    .addEventListener("input", () => {

        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            loadGigs();
        }, 250);
    });


document
    .getElementById("categoryFilter")
    .addEventListener("change", loadGigs);


document
    .getElementById("sortFilter")
    .addEventListener("change", loadGigs);


/* =========================================
   BOOKING
========================================= */

document
    .getElementById("bookingForm")
    .addEventListener("submit", async event => {

        event.preventDefault();


        const status =
            document.getElementById("bookingMessageStatus");


        const booking = {

            gig_id:
                document.getElementById("bookingGigId").value,

            client_name:
                document.getElementById("bookingClientName").value,

            client_email:
                document.getElementById("bookingClientEmail").value,

            message:
                document.getElementById("bookingMessage").value
        };


        status.textContent = "Sending request...";


        try {

            await api("/api/bookings", {

                method: "POST",

                body: JSON.stringify(booking)

            });


            closeBookingModal();

            showToast(
                "Booking request sent successfully!"
            );


            loadGigs();

            loadClientBookings();


        } catch (error) {

            status.textContent = error.message;
        }

    });


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}
