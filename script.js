/* =====================================================
   CREATORHUB
   Pure HTML + CSS + JavaScript
   Uses localStorage for data
===================================================== */


/* =====================================================
   SAMPLE GIGS
===================================================== */

const defaultGigs = [
    {
        id: 1,
        creator: "Maya",
        title: "I will design a modern social media poster",
        category: "Design",
        rate: 25,
        description:
            "Clean, modern and eye-catching social media graphics for your brand, event or personal project.",
        createdAt: Date.now() - 600000
    },

    {
        id: 2,
        creator: "Alex",
        title: "I will edit your short-form video",
        category: "Video",
        rate: 40,
        description:
            "Fast-paced edits for Reels, Shorts and TikTok with captions, transitions and music.",
        createdAt: Date.now() - 500000
    },

    {
        id: 3,
        creator: "Jordan",
        title: "I will build a simple landing page",
        category: "Development",
        rate: 60,
        description:
            "A responsive and clean landing page built for portfolios, small businesses and personal projects.",
        createdAt: Date.now() - 400000
    },

    {
        id: 4,
        creator: "Aarav",
        title: "I will photograph your event",
        category: "Photography",
        rate: 80,
        description:
            "Natural event photography with carefully selected and edited final images.",
        createdAt: Date.now() - 300000
    },

    {
        id: 5,
        creator: "Zoya",
        title: "I will write engaging captions for your brand",
        category: "Writing",
        rate: 20,
        description:
            "Creative captions designed to match your tone and make your content more engaging.",
        createdAt: Date.now() - 200000
    },

    {
        id: 6,
        creator: "Sam",
        title: "I will create a custom music loop",
        category: "Music",
        rate: 35,
        description:
            "Original short music loops for videos, games, streams and creative projects.",
        createdAt: Date.now() - 100000
    }
];


/* =====================================================
   INITIAL DATA
===================================================== */

let gigs = JSON.parse(localStorage.getItem("creatorhub_gigs"));

let bookings = JSON.parse(localStorage.getItem("creatorhub_bookings"));


/*
   If this is the first time opening the website,
   put sample gigs into localStorage.
*/

if (!gigs) {
    gigs = defaultGigs;
    saveGigs();
}

if (!bookings) {
    bookings = [];
    saveBookings();
}


/* =====================================================
   LOCAL STORAGE
===================================================== */

function saveGigs() {
    localStorage.setItem(
        "creatorhub_gigs",
        JSON.stringify(gigs)
    );
}


function saveBookings() {
    localStorage.setItem(
        "creatorhub_bookings",
        JSON.stringify(bookings)
    );
}


/* =====================================================
   CURRENT USER
===================================================== */

let currentUser =
    localStorage.getItem("creatorhub_current_user") || "Alex";


document.getElementById("currentUser").value = currentUser;


function changeUser() {

    currentUser =
        document.getElementById("currentUser").value;

    localStorage.setItem(
        "creatorhub_current_user",
        currentUser
    );

    updateUserNames();

    loadMarketplace();

    loadDashboard();

    loadClientBookings();

    showToast(
        "Now viewing as " + currentUser
    );
}


function updateUserNames() {

    const dashboardUser =
        document.getElementById("dashboardUser");

    const bookingUser =
        document.getElementById("bookingUser");

    if (dashboardUser) {
        dashboardUser.textContent = currentUser;
    }

    if (bookingUser) {
        bookingUser.textContent = currentUser;
    }

    const creatorName =
        document.getElementById("creatorName");

    if (creatorName) {
        creatorName.value = currentUser;
    }

}


/* =====================================================
   PAGE NAVIGATION
===================================================== */

function showPage(pageName) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(function(page) {
        page.classList.remove("active-page");
    });


    const selectedPage =
        document.getElementById(pageName);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }


    /*
       Update navbar button
    */

    const navButtons =
        document.querySelectorAll(".nav-btn");

    navButtons.forEach(function(button) {
        button.classList.remove("active");
    });


    const buttonMap = {
        marketplace: 0,
        post: 1,
        dashboard: 2,
        bookings: 3
    };

    const buttonIndex =
        buttonMap[pageName];

    if (buttonIndex !== undefined) {
        navButtons[buttonIndex].classList.add("active");
    }


    /*
       Load page-specific data
    */

    if (pageName === "marketplace") {
        loadMarketplace();
    }

    if (pageName === "dashboard") {
        loadDashboard();
    }

    if (pageName === "bookings") {
        loadClientBookings();
    }

    if (pageName === "post") {
        updateUserNames();
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   CATEGORY ICONS
===================================================== */

function getCategoryIcon(category) {

    const icons = {
        Design: "🎨",
        Video: "🎬",
        Music: "🎵",
        Development: "💻",
        Photography: "📷",
        Writing: "✍️"
    };

    return icons[category] || "✦";
}


/* =====================================================
   MARKETPLACE
===================================================== */

function loadMarketplace() {

    filterGigs();

}


function filterGigs() {

    const searchInput =
        document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const sortFilter =
        document.getElementById("sortFilter");


    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const category =
        categoryFilter.value;


    const sort =
        sortFilter.value;


    let filtered =
        gigs.filter(function(gig) {

            const matchesSearch =
                gig.title.toLowerCase().includes(search) ||
                gig.description.toLowerCase().includes(search) ||
                gig.creator.toLowerCase().includes(search) ||
                gig.category.toLowerCase().includes(search);


            const matchesCategory =
                category === "All" ||
                gig.category === category;


            return matchesSearch && matchesCategory;

        });


    /*
       Sorting
    */

    if (sort === "newest") {

        filtered.sort(function(a, b) {
            return b.createdAt - a.createdAt;
        });

    }


    if (sort === "priceLow") {

        filtered.sort(function(a, b) {
            return a.rate - b.rate;
        });

    }


    if (sort === "priceHigh") {

        filtered.sort(function(a, b) {
            return b.rate - a.rate;
        });

    }


    renderGigs(filtered);


    document.getElementById("resultCount").textContent =
        filtered.length +
        (filtered.length === 1 ? " gig" : " gigs");

}


function renderGigs(list) {

    const grid =
        document.getElementById("gigGrid");

    const noResults =
        document.getElementById("noResults");


    grid.innerHTML = "";


    if (list.length === 0) {

        noResults.classList.remove("hidden");

        return;

    }


    noResults.classList.add("hidden");


    list.forEach(function(gig) {

        const card =
            document.createElement("article");

        card.className = "gig-card";


        card.innerHTML = `

            <div class="gig-image ${gig.category}">
                ${getCategoryIcon(gig.category)}
            </div>

            <div class="gig-content">

                <span class="category">
                    ${escapeHTML(gig.category)}
                </span>

                <h3 class="gig-title">
                    ${escapeHTML(gig.title)}
                </h3>

                <p class="gig-description">
                    ${escapeHTML(gig.description)}
                </p>

                <div class="creator-row">

                    <span class="creator">
                        by ${escapeHTML(gig.creator)}
                    </span>

                    <span class="price">
                        $${gig.rate}
                        <small>starting</small>
                    </span>

                </div>

                <button
                    class="book-btn"
                    onclick="openBooking(${gig.id})"
                >
                    Book this gig →
                </button>

            </div>
        `;


        grid.appendChild(card);

    });

}


/* =====================================================
   POST A GIG
===================================================== */

document
    .getElementById("gigForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const creator =
            document.getElementById("creatorName")
                .value.trim();


        const title =
            document.getElementById("gigTitle")
                .value.trim();


        const category =
            document.getElementById("gigCategory")
                .value;


        const rate =
            Number(
                document.getElementById("gigRate")
                    .value
            );


        const description =
            document.getElementById("gigDescription")
                .value.trim();


        if (
            !creator ||
            !title ||
            !category ||
            !rate ||
            !description
        ) {

            showToast("Please complete every field.");

            return;
        }


        const newGig = {

            id: Date.now(),

            creator: creator,

            title: title,

            category: category,

            rate: rate,

            description: description,

            createdAt: Date.now()

        };


        gigs.push(newGig);

        saveGigs();


        this.reset();


        /*
           Put current user's name back
        */

        document.getElementById("creatorName")
            .value = currentUser;


        showToast(
            "Your gig was published!"
        );


        showPage("marketplace");

    });


/* =====================================================
   BOOKING MODAL
===================================================== */

function openBooking(gigId) {

    const gig =
        gigs.find(function(item) {
            return item.id === gigId;
        });


    if (!gig) {
        return;
    }


    /*
       DP2:
       Check whether this gig already has
       an active booking.
    */

    const activeBooking =
        bookings.find(function(booking) {

            return (
                booking.gigId === gigId &&
                (
                    booking.status === "Pending" ||
                    booking.status === "Accepted"
                )
            );

        });


    if (activeBooking) {

        if (activeBooking.status === "Pending") {

            showToast(
                "This gig already has a pending booking."
            );

        } else {

            showToast(
                "This gig has already been booked."
            );

        }

        return;
    }


    document.getElementById("bookingGigId")
        .value = gig.id;


    document.getElementById("modalGigTitle")
        .textContent = gig.title;


    document.getElementById("modalGigCreator")
        .textContent =
        "By " + gig.creator +
        " • $" + gig.rate;


    document.getElementById("clientName")
        .value = currentUser;


    document.getElementById("clientEmail")
        .value =
        currentUser.toLowerCase() +
        "@creatorhub.demo";


    document.getElementById("clientMessage")
        .value = "";


    document
        .getElementById("bookingModal")
        .classList.remove("hidden");

}


function closeModal() {

    document
        .getElementById("bookingModal")
        .classList.add("hidden");

}


/* =====================================================
   SUBMIT BOOKING
===================================================== */

document
    .getElementById("bookingForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const gigId =
            Number(
                document.getElementById("bookingGigId")
                    .value
            );


        const clientName =
            document.getElementById("clientName")
                .value.trim();


        const clientEmail =
            document.getElementById("clientEmail")
                .value.trim();


        const message =
            document.getElementById("clientMessage")
                .value.trim();


        const gig =
            gigs.find(function(item) {
                return item.id === gigId;
            });


        if (!gig) {

            showToast("Gig not found.");

            return;
        }


        /*
           DP2 again:
           Don't allow double booking.
        */

        const activeBooking =
            bookings.find(function(booking) {

                return (
                    booking.gigId === gigId &&
                    (
                        booking.status === "Pending" ||
                        booking.status === "Accepted"
                    )
                );

            });


        if (activeBooking) {

            showToast(
                "This gig is no longer available."
            );

            closeModal();

            return;
        }


        const newBooking = {

            id: Date.now(),

            gigId: gigId,

            gigTitle: gig.title,

            creator: gig.creator,

            clientName: clientName,

            clientEmail: clientEmail,

            message: message,

            status: "Pending",

            createdAt: Date.now()

        };


        bookings.push(newBooking);

        saveBookings();


        closeModal();


        showToast(
            "Booking request sent!"
        );


        /*
           Refresh marketplace and bookings.
        */

        loadMarketplace();

        loadClientBookings();

    });


/* =====================================================
   CREATOR DASHBOARD
===================================================== */

function loadDashboard() {

    updateUserNames();


    const creatorBookings =
        bookings.filter(function(booking) {

            return booking.creator === currentUser;

        });


    const pending =
        creatorBookings.filter(function(booking) {

            return booking.status === "Pending";

        }).length;


    const accepted =
        creatorBookings.filter(function(booking) {

            return booking.status === "Accepted";

        }).length;


    document.getElementById("pendingCount")
        .textContent = pending;


    document.getElementById("acceptedCount")
        .textContent = accepted;


    document.getElementById("totalCount")
        .textContent = creatorBookings.length;


    renderCreatorBookings(
        creatorBookings
    );

}


function renderCreatorBookings(list) {

    const container =
        document.getElementById("creatorBookings");


    container.innerHTML = "";


    if (list.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    📭
                </div>

                <h3>No booking requests yet</h3>

                <p>
                    New client requests will appear here.
                </p>

            </div>

        `;

        return;
    }


    /*
       Newest booking first
    */

    list.sort(function(a, b) {

        return b.createdAt - a.createdAt;

    });


    list.forEach(function(booking) {

        const card =
            document.createElement("div");

        card.className = "booking-card";


        let actionHTML = "";


        if (booking.status === "Pending") {

            actionHTML = `

                <div class="booking-actions">

                    <button
                        class="accept-btn"
                        onclick="acceptBooking(${booking.id})"
                    >
                        ✓ Accept
                    </button>

                    <button
                        class="decline-btn"
                        onclick="declineBooking(${booking.id})"
                    >
                        Decline
                    </button>

                </div>

            `;

        } else {

            actionHTML = `

                <span class="status ${booking.status}">
                    ${booking.status}
                </span>

            `;

        }


        card.innerHTML = `

            <div>

                <div class="booking-title">
                    ${escapeHTML(booking.gigTitle)}
                </div>

                <div class="booking-meta">

                    Client:
                    <strong>
                        ${escapeHTML(booking.clientName)}
                    </strong>

                    <br>

                    Email:
                    ${escapeHTML(booking.clientEmail)}

                </div>

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


            ${actionHTML}

        `;


        container.appendChild(card);

    });

}


/* =====================================================
   ACCEPT BOOKING
===================================================== */

function acceptBooking(bookingId) {

    const booking =
        bookings.find(function(item) {

            return item.id === bookingId;

        });


    if (!booking) {
        return;
    }


    /*
       Only the creator of the gig can accept it.
    */

    if (booking.creator !== currentUser) {

        showToast(
            "You cannot manage this booking."
        );

        return;
    }


    /*
       DP2:
       Make sure another booking wasn't already accepted.
    */

    const anotherAccepted =
        bookings.find(function(item) {

            return (
                item.gigId === booking.gigId &&
                item.id !== booking.id &&
                item.status === "Accepted"
            );

        });


    if (anotherAccepted) {

        showToast(
            "Another booking is already accepted."
        );

        return;
    }


    booking.status = "Accepted";

    saveBookings();


    showToast(
        "Booking accepted!"
    );


    loadDashboard();

    loadClientBookings();

    loadMarketplace();

}


/* =====================================================
   DECLINE BOOKING
===================================================== */

function declineBooking(bookingId) {

    const booking =
        bookings.find(function(item) {

            return item.id === bookingId;

        });


    if (!booking) {
        return;
    }


    if (booking.creator !== currentUser) {

        showToast(
            "You cannot manage this booking."
        );

        return;
    }


    booking.status = "Declined";

    saveBookings();


    showToast(
        "Booking declined."
    );


    loadDashboard();

    loadClientBookings();

    loadMarketplace();

}


/* =====================================================
   CLIENT BOOKINGS
===================================================== */

function loadClientBookings() {

    updateUserNames();


    /*
       For this demo we identify a client by name.
    */

    const clientBookings =
        bookings.filter(function(booking) {

            return booking.clientName === currentUser;

        });


    const container =
        document.getElementById("clientBookings");


    container.innerHTML = "";


    if (clientBookings.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    🛍️
                </div>

                <h3>No bookings yet</h3>

                <p>
                    Browse the marketplace and book a creator.
                </p>

                <br>

                <button
                    class="primary-btn"
                    onclick="showPage('marketplace')"
                >
                    Explore gigs →
                </button>

            </div>

        `;

        return;
    }


    clientBookings.sort(function(a, b) {

        return b.createdAt - a.createdAt;

    });


    clientBookings.forEach(function(booking) {

        const card =
            document.createElement("div");

        card.className = "client-booking";


        let action = "";


        /*
           DP1:
           Declined bookings remain visible.
           Client gets a "Find another gig" action.
        */

        if (booking.status === "Declined") {

            action = `

                <button
                    class="find-another"
                    onclick="showPage('marketplace')"
                >
                    Find another gig →
                </button>

            `;

        }


        card.innerHTML = `

            <div>

                <h3>
                    ${escapeHTML(booking.gigTitle)}
                </h3>

                <p>
                    Creator:
                    <strong>
                        ${escapeHTML(booking.creator)}
                    </strong>
                    <br>

                    Requested by:
                    ${escapeHTML(booking.clientName)}
                </p>

                ${action}

            </div>


            <div>

                <span class="status ${booking.status}">
                    ${booking.status}
                </span>

            </div>

        `;


        container.appendChild(card);

    });

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById("toast");


    const toastMessage =
        document.getElementById("toastMessage");


    toastMessage.textContent = message;


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(function() {

            toast.classList.remove("show");

        }, 2800);

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =====================================================
   INITIALIZE
===================================================== */

updateUserNames();

loadMarketplace();

loadDashboard();

loadClientBookings();


/*
   Set creator name to current user
*/

document.getElementById("creatorName")
    .value = currentUser;
