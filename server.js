const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* --------------------------------
   GET ALL GIGS
-------------------------------- */

app.get("/api/gigs", (req, res) => {
    const {
        search = "",
        category = "All",
        sort = "newest"
    } = req.query;

    let query = `
        SELECT *
        FROM gigs
        WHERE 1 = 1
    `;

    const params = {};

    if (search.trim()) {
        query += `
            AND (
                title LIKE @search
                OR description LIKE @search
                OR creator_name LIKE @search
                OR category LIKE @search
            )
        `;

        params.search = `%${search.trim()}%`;
    }

    if (category !== "All") {
        query += ` AND category = @category`;
        params.category = category;
    }

    if (sort === "price-low") {
        query += ` ORDER BY rate ASC`;
    } else if (sort === "price-high") {
        query += ` ORDER BY rate DESC`;
    } else {
        query += ` ORDER BY datetime(created_at) DESC`;
    }

    const gigs = db.prepare(query).all(params);

    res.json(gigs);
});


/* --------------------------------
   GET ONE GIG
-------------------------------- */

app.get("/api/gigs/:id", (req, res) => {
    const gig = db
        .prepare("SELECT * FROM gigs WHERE id = ?")
        .get(req.params.id);

    if (!gig) {
        return res.status(404).json({
            error: "Gig not found"
        });
    }

    res.json(gig);
});


/* --------------------------------
   CREATE GIG
-------------------------------- */

app.post("/api/gigs", (req, res) => {
    const {
        creator_name,
        title,
        category,
        rate,
        description
    } = req.body;

    if (
        !creator_name ||
        !title ||
        !category ||
        !rate ||
        !description
    ) {
        return res.status(400).json({
            error: "Please fill in all fields."
        });
    }

    const numericRate = Number(rate);

    if (Number.isNaN(numericRate) || numericRate <= 0) {
        return res.status(400).json({
            error: "Rate must be a positive number."
        });
    }

    const result = db.prepare(`
        INSERT INTO gigs
        (creator_name, title, category, rate, description)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        creator_name.trim(),
        title.trim(),
        category,
        numericRate,
        description.trim()
    );

    const gig = db
        .prepare("SELECT * FROM gigs WHERE id = ?")
        .get(result.lastInsertRowid);

    res.status(201).json(gig);
});


/* --------------------------------
   CREATE BOOKING
-------------------------------- */

app.post("/api/bookings", (req, res) => {
    const {
        gig_id,
        client_name,
        client_email,
        message
    } = req.body;

    if (!gig_id || !client_name || !client_email) {
        return res.status(400).json({
            error: "Name, email and gig are required."
        });
    }

    const gig = db
        .prepare("SELECT * FROM gigs WHERE id = ?")
        .get(gig_id);

    if (!gig) {
        return res.status(404).json({
            error: "Gig not found."
        });
    }

    /*
       DP2:
       A gig cannot receive another booking while
       it already has a Pending booking or an Accepted booking.
    */

    const existingBooking = db.prepare(`
        SELECT *
        FROM bookings
        WHERE gig_id = ?
        AND status IN ('Pending', 'Accepted')
        LIMIT 1
    `).get(gig_id);

    if (existingBooking) {
        return res.status(409).json({
            error: existingBooking.status === "Pending"
                ? "This gig already has a pending booking."
                : "This gig has already been booked."
        });
    }

    const result = db.prepare(`
        INSERT INTO bookings
        (gig_id, client_name, client_email, message, status)
        VALUES (?, ?, ?, ?, 'Pending')
    `).run(
        gig_id,
        client_name.trim(),
        client_email.trim(),
        message ? message.trim() : ""
    );

    const booking = db.prepare(`
        SELECT
            bookings.*,
            gigs.title,
            gigs.creator_name,
            gigs.category,
            gigs.rate
        FROM bookings
        JOIN gigs ON bookings.gig_id = gigs.id
        WHERE bookings.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(booking);
});


/* --------------------------------
   GET CLIENT BOOKINGS
-------------------------------- */

app.get("/api/bookings/client/:email", (req, res) => {
    const bookings = db.prepare(`
        SELECT
            bookings.*,
            gigs.title,
            gigs.creator_name,
            gigs.category,
            gigs.rate
        FROM bookings
        JOIN gigs ON bookings.gig_id = gigs.id
        WHERE LOWER(bookings.client_email) = LOWER(?)
        ORDER BY datetime(bookings.created_at) DESC
    `).all(req.params.email);

    res.json(bookings);
});


/* --------------------------------
   GET CREATOR BOOKINGS
-------------------------------- */

app.get("/api/bookings/creator/:creator", (req, res) => {
    const bookings = db.prepare(`
        SELECT
            bookings.*,
            gigs.title,
            gigs.creator_name,
            gigs.category,
            gigs.rate
        FROM bookings
        JOIN gigs ON bookings.gig_id = gigs.id
        WHERE LOWER(gigs.creator_name) = LOWER(?)
        ORDER BY datetime(bookings.created_at) DESC
    `).all(req.params.creator);

    res.json(bookings);
});


/* --------------------------------
   ACCEPT BOOKING
-------------------------------- */

app.patch("/api/bookings/:id/accept", (req, res) => {
    const booking = db.prepare(`
        SELECT *
        FROM bookings
        WHERE id = ?
    `).get(req.params.id);

    if (!booking) {
        return res.status(404).json({
            error: "Booking not found."
        });
    }

    if (booking.status !== "Pending") {
        return res.status(400).json({
            error: "Only pending bookings can be accepted."
        });
    }

    const accepted = db.prepare(`
        SELECT *
        FROM bookings
        WHERE gig_id = ?
        AND status = 'Accepted'
        LIMIT 1
    `).get(booking.gig_id);

    if (accepted) {
        return res.status(409).json({
            error: "This gig already has an accepted booking."
        });
    }

    db.prepare(`
        UPDATE bookings
        SET status = 'Accepted'
        WHERE id = ?
    `).run(req.params.id);

    const updated = db.prepare(`
        SELECT
            bookings.*,
            gigs.title,
            gigs.creator_name,
            gigs.category,
            gigs.rate
        FROM bookings
        JOIN gigs ON bookings.gig_id = gigs.id
        WHERE bookings.id = ?
    `).get(req.params.id);

    res.json(updated);
});


/* --------------------------------
   DECLINE BOOKING
-------------------------------- */

app.patch("/api/bookings/:id/decline", (req, res) => {
    const booking = db.prepare(`
        SELECT *
        FROM bookings
        WHERE id = ?
    `).get(req.params.id);

    if (!booking) {
        return res.status(404).json({
            error: "Booking not found."
        });
    }

    if (booking.status !== "Pending") {
        return res.status(400).json({
            error: "Only pending bookings can be declined."
        });
    }

    db.prepare(`
        UPDATE bookings
        SET status = 'Declined'
        WHERE id = ?
    `).run(req.params.id);

    const updated = db.prepare(`
        SELECT
            bookings.*,
            gigs.title,
            gigs.creator_name,
            gigs.category,
            gigs.rate
        FROM bookings
        JOIN gigs ON bookings.gig_id = gigs.id
        WHERE bookings.id = ?
    `).get(req.params.id);

    res.json(updated);
});


/* --------------------------------
   FALLBACK
-------------------------------- */

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.listen(PORT, () => {
    console.log(`Creator Marketplace running on http://localhost:${PORT}`);
});
