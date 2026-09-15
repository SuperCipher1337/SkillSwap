/* =========================================
   PAGE NAVIGATION
========================================= */

function showPage(pageId) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active-page");
    });

    document
        .getElementById(pageId)
        .classList.add("active-page");


    document.querySelectorAll(".nav-link").forEach(button => {
        button.classList.remove("active");
    });

    const activeButton = document.querySelector(
        `.nav-link[data-page="${pageId}"]`
    );

    if (activeButton) {
        activeButton.classList.add("active");
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (pageId === "marketplace") {
        loadGigs();
    }

    if (pageId === "creator-dashboard") {
        loadCreatorDashboard();
    }

    if (pageId === "my-bookings") {
        loadClientBookings();
    }
}


/* =========================================
   USER SWITCHER
========================================= */

const currentUserSelect =
    document.getElementById("currentUser");

currentUserSelect.addEventListener("change", () => {

    const user = currentUserSelect.value;

    document.getElementById("dashboardCreator").textContent = user;

    document.getElementById("clientName").textContent = user;

    document.getElementById("clientAvatar").textContent =
        user.charAt(0).toUpperCase();

    loadCreatorDashboard();
    loadClientBookings();

});


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    const toast = document.getElementById("toast");
    const toastText = document.getElementById("toastText");

    toastText.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


/* =========================================
   API HELPER
========================================= */

async function api(url, options = {}) {

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
    }

    return data;
}


/* =========================================
   BOOKING MODAL
========================================= */

function openBookingModal(gig) {

    document.getElementById("bookingGigId").value = gig.id;

    document.getElementById("modalGigTitle").textContent =
        gig.title;

    document.getElementById("modalGigDescription").textContent =
        gig.description;

    document.getElementById("modalGigRate").textContent =
        gig.rate;

    document.getElementById("bookingClientName").value =
        currentUserSelect.value;

    document.getElementById("bookingClientEmail").value = "";

    document.getElementById("bookingMessage").value = "";

    document.getElementById("bookingMessageStatus").textContent = "";

    document
        .getElementById("bookingModal")
        .classList.remove("hidden");
}


function closeBookingModal() {

    document
        .getElementById("bookingModal")
        .classList.add("hidden");
}


/* =========================================
   INITIAL STATE
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const user = currentUserSelect.value;

    document.getElementById("dashboardCreator").textContent = user;

    document.getElementById("clientName").textContent = user;

    document.getElementById("clientAvatar").textContent =
        user.charAt(0).toUpperCase();

    loadGigs();
});
