import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import multer from 'multer';

dotenv.config();
const app = express();
const PORT = 4000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// change the password to yours, or just an empty string
// Database connection
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'VCjp1005',
    database: 'mbs'
}).promise()


// Configure multer for ADMIN picture uplaods
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'assets');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });


// Secret key for tokens
const JWT_SECRET = process.env.JWT_SECRET;


// ------------------ MIDDLEWARE --------------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const __dirname = path.dirname(new URL(import.meta.url).pathname);
// static files
app.use(express.static(path.join(__dirname)));



// ------------------ AUTHENTICATION --------------------------
function authenticateToken(req, res, next) {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).send("Access denied.");

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send("Invalid token.");
        req.user = user;
        next();
    });
}

// To authenticate admin users
function authenticateAdmin(req, res, next) {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).send("Access denied.");

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send("Invalid token.");
        if (!user.isAdmin) return res.status(403).send("Admin access required.");
        req.user = user;
        next();
    });
}


// ------------------ ROUTES --------------------------
// Routes for static HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'home.html')));
app.get('/catalog', (req, res) => res.sendFile(path.join(__dirname, 'catalog.html')));
app.get('/upcoming', (req, res) => res.sendFile(path.join(__dirname, 'upcoming.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// ------------------ AUTH ROUTES --------------------------
// User Registration
app.post('/register', async (req, res) => {
    const { firstName, lastName, email, address, phone, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO User_Info (first_name, last_name, email, password, phone_number)
             VALUES (?, ?, ?, ?, ?)`,
            [firstName, lastName, email, hashedPassword, phone]
        );

        res.status(201).send("User registered successfully");
    } catch (error) {
        console.error("Error registering user:", error);
        if (error.code === "ER_DUP_ENTRY") {
            res.status(400).json({ message: "Email is already in use" });
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
});

// User login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM User_Info WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Use the `is_admin` column from the database to check admin status
        const isAdmin = user.is_admin === 1;

        const token = jwt.sign({ userId: user.user_id, email: user.email, isAdmin }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true });
        res.status(200).json({ message: "Login successful", email: user.email, isAdmin });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An error occurred. Please try again." });
    }
});

// User logout
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: "Logged out successfully." });
});

// ------------------ USER ROUTES --------------------------

// Fetch movies from database
app.get('/movies', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Movies');
        const movies = rows.map(movie => ({
            ...movie,
            showtimes: JSON.parse(movie.showtimes),
            image: `/assets/${movie.image.split('/').pop()}`
        }));

        console.log("Movies from Database:", movies);
        res.json(movies);
    } catch (error) {
        console.error("Error fetching movies:", error);
        res.status(500).send("An error occurred while fetching movies.");
    }
});

// Fetches the reviews for a movie
app.get('/reviews/:movieId', async (req, res) => {
    const { movieId } = req.params;

    try {
        const [reviews] = await pool.query(
            `SELECT Reviews.review, Reviews.created_at, User_Info.first_name, User_Info.last_name 
             FROM Reviews 
             JOIN User_Info ON Reviews.user_id = User_Info.user_id 
             WHERE Reviews.movie_id = ? 
             ORDER BY Reviews.created_at DESC`,
            [movieId]
        );

        res.json(reviews); // Return the reviews as a JSON response
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Failed to fetch reviews" });
    }
});

// Route to submit reviews for a movie
app.post('/reviews', authenticateToken, async (req, res) => {
    const { movieId, review } = req.body;
    const userId = req.user.userId;

    if (!movieId || !review) {
        return res.status(400).json({ message: "Movie ID and review are required" });
    }

    try {
        // Insert the review into the "Reviews" table
        await pool.query(
            `INSERT INTO Reviews (user_id, movie_id, review) VALUES (?, ?, ?)`,
            [userId, movieId, review]
        );
        res.status(201).json({ message: "Review submitted successfully" });
    } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({ message: "Failed to submit review" });
    }
});

// Route to book a ticket for a movie
app.post('/book-ticket', authenticateToken, async (req, res) => {
    const { movieId, showtime, seats } = req.body;
    const userEmail = req.user.email;

    try {
        console.log("Booking request received:", { movieId, showtime, seats, userEmail });

        const [movieRows] = await pool.query('SELECT * FROM Movies WHERE id = ?', [movieId]);
        const movie = movieRows[0];

        // Checks if movie exists
        if (!movie) {
            console.error("Movie not found:", movieId);
            return res.status(400).send("Invalid movie ID.");
        }

        if (!JSON.parse(movie.showtimes).includes(showtime)) {
            console.error("Invalid showtime:", showtime);
            return res.status(400).send("Invalid showtime.");
        }

        // number of seats
        if (seats <= 0 || seats > 10) {
            console.error("Invalid number of seats:", seats);
            return res.status(400).send("Invalid number of seats.");
        }

        // gets users id from database w/ their email
        const [userRows] = await pool.query('SELECT user_id FROM User_Info WHERE email = ?', [userEmail]);
        if (userRows.length === 0) {
            console.error("User not found:", userEmail);
            return res.status(404).send("User not found.");
        }

        const userId = userRows[0].user_id;
        const totalCost = movie.ticketPrice * seats;
        const ticketNumber = `TKT-${movieId}-${Date.now()}`;

        console.log("Creating ticket with details:", {
            userId,
            movieId,
            movieTitle: movie.title,
            showtime,
            seats,
            totalCost,
            ticketNumber,
        });

        await pool.query(
            `INSERT INTO Ticket_History (user_id, movie_id, movie_title, showtime, seats, ticket_number, total_cost)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, movieId, movie.title, showtime, seats, ticketNumber, totalCost]
        );

        await pool.query(
            'UPDATE Movies SET ticketsSold = ticketsSold + ? WHERE id = ?',
            [seats, movieId]
        );

        res.json({
            message: "Booking confirmed!",
            movie: movie.title,
            showtime,
            seats,
            totalCost,
            ticketNumber,
        });
    } catch (error) {
        console.error("Error booking ticket:", error);
        res.status(500).send("Failed to book ticket. Please try again.");
    }
});

// Route to fetch ticket booking history
app.post('/ticket-history', authenticateToken, async (req, res) => {
    const userEmail = req.user.email;

    try {
        // Fetch the user_id with user's email
        const [userRows] = await pool.query('SELECT user_id FROM User_Info WHERE email = ?', [userEmail]);
        if (userRows.length === 0) {
            return res.status(404).send("User not found.");
        }

        const userId = userRows[0].user_id;

        // Fetch ticket history using user_id
        const [historyRows] = await pool.query('SELECT * FROM Ticket_History WHERE user_id = ?', [userId]);
        
        // debug
        console.log("Ticket History Response:", historyRows);
        
        res.json(historyRows || []);
    } catch (error) {
        console.error("Error fetching ticket history:", error);
        res.status(500).send("Failed to fetch ticket history.");
    }
});

// ------------------ ADMIN ROUTES --------------------------

// Admin Route to View System Status
app.get('/admin/status', async (req, res) => {
    try {
        // Fetch movies from the database
        const [rows] = await pool.query('SELECT * FROM Movies');
        const movies = rows.map((movie) => ({
            ...movie,
            showtimes: JSON.parse(movie.showtimes),
        }));

        // Separate current and upcoming movies
        const currentMovies = movies.filter((movie) => movie.type === "current");
        const upcomingMovies = movies.filter((movie) => movie.type === "upcoming");

        const totalTicketsSold = movies.reduce((total, movie) => total + movie.ticketsSold, 0);

        res.json({
            totalTicketsSold,
            currentMovies,
            upcomingMovies,
        });
    } catch (error) {
        console.error("Error fetching admin status:", error);
        res.status(500).json({ message: "Failed to fetch admin status. Please try again." });
    }
});



// Admin Route to Add a New Show
app.post('/admin/add-show', authenticateAdmin, upload.single('image'), async (req, res) => {
    const { title, synopsis, showtimes, ticketPrice, type } = req.body;
    const image = req.file ? `/assets/${req.file.filename}` : '/assets/default.jpg';

    try {
        const [result] = await pool.query(
            `INSERT INTO Movies (title, synopsis, showtimes, ticketPrice, type, ticketsSold, image)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                synopsis,
                JSON.stringify(Array.isArray(showtimes) ? showtimes : [showtimes]),
                parseFloat(ticketPrice),
                type,
                0,
                image
            ]
        );

        const [movie] = await pool.query('SELECT * FROM Movies WHERE id = ?', [result.insertId]);
        res.status(201).json(movie[0]);
    } catch (error) {
        console.error("Error adding show:", error);
        res.status(500).send("Failed to add the show. Please try again.");
    }
});

// Admin Route to Remove a Show
app.delete('/admin/remove-show/:id', async (req, res) => {
    const showId = parseInt(req.params.id);

    try {
        const [result] = await pool.query('DELETE FROM Movies WHERE id = ?', [showId]);

        if (result.affectedRows > 0) {
            res.send("Show removed successfully!");
        } else {
            res.status(404).send("Show not found.");
        }
    } catch (error) {
        console.error("Error removing show:", error);
        res.status(500).send("Failed to remove the show. Please try again.");
    }
});

// ------------------ ERROR HANDLING --------------------------

// Error handling
app.use((req, res) => {
    res.status(404).send("Page not found");
});
