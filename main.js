window.onload = function () {
    const path = window.location.pathname;

    if (path.includes("admin.html")) {
        initializeAdminPage();
    } else if (path.includes("search.html")) {
        document.getElementById("search-form").addEventListener("submit", searchMovies);
    } else if (path.includes("movie-details.html")) {
        displayMovieDetails();
        document.getElementById("review-form").addEventListener("submit", submitReview);
    } else if (path.includes("history.html")) {
        loadTicketHistory();
    } else if (path.includes("home.html")) {
        fetchMoviesForHome();
    } else if (path.includes("catalog.html")) {
        fetchMoviesForCatalog();
    } else if (path.includes("upcoming.html")) {
        fetchMoviesForUpcoming();
    }
};

// ------------------ MOVIE FETCHING --------------------------
//fetch and display movies on home.html
async function fetchMoviesForHome() {
    try {
        const response = await fetch('/movies');
        const movies = await response.json();

        const movieList = document.getElementById("movie-list");
        if (!movieList) {
            console.error("Container with ID 'movie-list' not found for Home.");
            return;
        }

        movieList.innerHTML = "";

        // Display all movies
        movies.forEach((movie) => {
            const movieCard = document.createElement("div");
            movieCard.className = "movie-card";
            movieCard.innerHTML = `
                <a href="movie-details.html?id=${movie.id}">
                    <img 
                        src="${movie.image}" 
                        alt="${movie.title}" 
                        class="movie-image" 
                        style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px;" 
                    />
                    <h3>${movie.title}</h3>
                </a>
            `;
            movieList.appendChild(movieCard);
        });
    } catch (error) {
        console.error("Error fetching movies for home:", error);
    }
}

//fetch and display movies on catalog.html
async function fetchMoviesForCatalog() {
    try {
        const response = await fetch('/movies');
        const movies = await response.json();

        const movieList = document.getElementById("movie-list");
        if (!movieList) {
            console.error("Container with ID 'movie-list' not found for Catalog.");
            return;
        }

        movieList.innerHTML = "";

        // Filter and display only current movies
        const currentMovies = movies.filter((movie) => movie.type === "current");

        if (currentMovies.length === 0) {
            movieList.innerHTML = "<p>No currently playing movies available.</p>";
            return;
        }

        currentMovies.forEach((movie) => {
            const movieCard = document.createElement("div");
            movieCard.className = "movie-card";
            movieCard.innerHTML = `
                <a href="movie-details.html?id=${movie.id}">
                    <img 
                        src="${movie.image}" 
                        alt="${movie.title}" 
                        style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px;" 
                    />
                    <h3>${movie.title}</h3>
                </a>
            `;
            movieList.appendChild(movieCard);
        });
    } catch (error) {
        console.error("Error fetching movies for catalog:", error);
    }
}

//fetch and display movies on upcoming.html
async function fetchMoviesForUpcoming() {
    try {
        const response = await fetch('/movies');
        const movies = await response.json();

        const movieList = document.getElementById("movie-list");
        if (!movieList) {
            console.error("Container with ID 'movie-list' not found for Upcoming.");
            return;
        }

        movieList.innerHTML = "";

        // Filter and display upcoming movies
        movies
            .filter((movie) => movie.type === "upcoming")
            .forEach((movie) => {
                const movieCard = document.createElement("div");
                movieCard.className = "movie-card";
                movieCard.innerHTML = `
                    <a href="movie-details.html?id=${movie.id}">
                        <img 
                            src="${movie.image}" 
                            alt="${movie.title}" 
                            style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px;" 
                        />
                        <h3>${movie.title}</h3>
                    </a>
                `;
                movieList.appendChild(movieCard);
            });
    } catch (error) {
        console.error("Error fetching movies for upcoming:", error);
    }
}
    document.addEventListener("DOMContentLoaded", () => {
        const path = window.location.pathname;
        if (path.includes("home.html")) {
            fetchMoviesForHome();
        } else if (path.includes("catalog.html")) {
            fetchMoviesForCatalog();
        } else if (path.includes("upcoming.html")) {
            fetchMoviesForUpcoming();
        }
    });
    
// ------------------ REVIEWS --------------------------
    // fetch and display reviews for movies
    async function fetchReviews(movieId) {
        try {
            const response = await fetch(`/reviews/${movieId}`);
            const reviews = await response.json();
    
            const reviewsList = document.getElementById("reviews-list");
            reviewsList.innerHTML = "";
    
            if (reviews.length > 0) {
                reviews.forEach((review) => {
                    const reviewItem = document.createElement("div");
                    reviewItem.className = "review-item";
                    reviewItem.innerHTML = `
                        <p><strong>${review.first_name} ${review.last_name}:</strong> ${review.review}</p>
                        <small>${new Date(review.created_at).toLocaleString()}</small>
                    `;
                    reviewsList.appendChild(reviewItem);
                });
            } else {
                reviewsList.innerHTML = "<p>No reviews yet. Be the first to leave one!</p>";
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            document.getElementById("reviews-list").innerHTML =
                "<p>Failed to load reviews. Please try again later.</p>";
        }
    }
    
    // submit a review
    async function submitReview(event) {
        event.preventDefault();
    
        const reviewText = document.getElementById("review-text").value.trim();
        const movieId = new URLSearchParams(window.location.search).get("id");
        const token = localStorage.getItem("token");
    
        if (!token) {
            alert("You must be logged in to leave a review.");
            window.location.href = "login.html";
            return;
        }
    
        try {
            const response = await fetch('/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ movieId, review: reviewText }),
            });
    
            if (response.ok) {
                alert("Review submitted successfully!");
                fetchReviews(movieId);
                document.getElementById("review-text").value = "";
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to submit review. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("An error occurred. Please try again later.");
        }
    }
    

    document.addEventListener("DOMContentLoaded", () => {
        const movieId = new URLSearchParams(window.location.search).get("id");
        if (movieId) {
            fetchReviews(movieId);
        }
    });    

// ------------------ USER ACTIONS --------------------------
// Booking Ticket for showtime
function bookSelectedShowtime() {
    const theater = document.getElementById("theater-dropdown").value;

    if (!theater) {
        alert("Please select a theater.");
        return;
    }

    const selectedShowtime = document.querySelector('input[name="showtime"]:checked');
    if (!selectedShowtime) {
        alert("Please select a showtime.");
        return;
    }

    const seats = parseInt(prompt("Enter the number of tickets (1-10):"), 10);

    if (isNaN(seats) || seats <= 0 || seats > 10) {
        alert("Invalid number of tickets. Please enter a value between 1 and 10.");
        return;
    }

    const movieId = new URLSearchParams(window.location.search).get("id");
    if (!movieId) {
        alert("Invalid movie ID.");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in. Please log in to book tickets.");
        window.location.href = "login.html";
        return;
    }

    console.log("Booking details:", { movieId, showtime: selectedShowtime.value, seats });

    fetch('/book-ticket', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            movieId: parseInt(movieId, 10),
            showtime: selectedShowtime.value,
            seats,
        }),
    })
        .then(async (response) => {
            if (response.ok) {
                const data = await response.json();
                alert(`Booking confirmed!\n\nMovie: ${data.movie}\nShowtime: ${data.showtime}\nSeats: ${data.seats}\nTotal Cost: $${data.totalCost}\nTicket Number: ${data.ticketNumber}`);
                document.getElementById("ticket-section").innerHTML = `
                    <h3>Your Confirmation:</h3>
                    <p><strong>Movie:</strong> ${data.movie}</p>
                    <p><strong>Showtime:</strong> ${data.showtime}</p>
                    <p><strong>Seats:</strong> ${data.seats}</p>
                    <p><strong>Total Cost:</strong> $${data.totalCost}</p>
                    <p><strong>Ticket Number:</strong> ${data.ticketNumber}</p>
                `;
            } else {
                const errorData = await response.json();
                console.error("Booking error response:", errorData);
                alert(`Booking failed: ${errorData.message}`);
            }
        })
        .catch((error) => {
            console.error("Error during booking:", error);
            alert("An unexpected error occurred. Please try again later.");
        });
}

// Load ticket history for the user
function loadTicketHistory() {
    const email = localStorage.getItem("loggedInUser");
    if (!email) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return;
    }

    fetch('/ticket-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    .then(response => response.json())
    .then(history => {
        const tableBody = document.querySelector("#ticket-history-table tbody");
        tableBody.innerHTML = "";
    
        if (history.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='2'>No ticket history found.</td></tr>";
        } else {
            history.forEach(ticket => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${ticket.movie_title || "Unknown"}</td>
                    <td>${ticket.showtime || "Unknown"} (${ticket.booking_date || "Unknown"})</td>
                `;
                tableBody.appendChild(row);
            });
        }
    })
    .catch(err => alert("Error loading ticket history."));
}

async function searchMovies(event) {
    event.preventDefault();
    const query = document.getElementById("search-input").value.toLowerCase();
    const resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML = "";

    try {
        const response = await fetch('/movies');
        const movies = await response.json();

        // Filter movies based on the search query
        const results = movies.filter(movie => movie.title.toLowerCase().includes(query));

        // Display results
        if (results.length > 0) {
            results.forEach(movie => {
                const movieCard = document.createElement("div");
                movieCard.className = "movie-card";
                movieCard.innerHTML = `
                    <a href="movie-details.html?id=${movie.id}">
                        <img src="${movie.image}" alt="${movie.title}" class="movie-image">
                        <h3>${movie.title}</h3>
                    </a>
                    <p>${movie.synopsis}</p>
                    ${movie.type === "current" ? `<button class="ticket-btn">Book Ticket</button>` : "<p>Coming Soon</p>"}
                `;
                resultsContainer.appendChild(movieCard);
            });
        } else {
            resultsContainer.innerHTML = "<p>No movies found. Please try a different title.</p>";
        }
    } catch (error) {
        console.error("Error fetching movies for search:", error);
        resultsContainer.innerHTML = "<p>Failed to fetch movies. Please try again later.</p>";
    }
}

// ------------------ ADMIN ACTIONS --------------------------
// Function to load system status on the admin page
async function loadSystemStatus() {
    try {
        const response = await fetch('/admin/status', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();

        document.getElementById("total-tickets-sold").textContent = data.totalTicketsSold;

        // Display current movies
        const currentMoviesList = document.getElementById("current-movies-list");
        currentMoviesList.innerHTML = "";
        data.currentMovies.forEach((movie) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `${movie.title} - Showtimes: ${movie.showtimes.join(", ")}`;
            currentMoviesList.appendChild(listItem);
        });

        // Display upcoming movies
        const upcomingMoviesList = document.getElementById("upcoming-movies-list");
        upcomingMoviesList.innerHTML = "";
        data.upcomingMovies.forEach((movie) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `${movie.title} - Showtimes: ${movie.showtimes.join(", ")} - Price: $${movie.ticketPrice}`;
            upcomingMoviesList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error loading system status:", error);
    }
}

async function addShow(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", document.getElementById("show-title").value.trim());
    formData.append("synopsis", document.getElementById("show-synopsis").value.trim());
    formData.append("showtimes", document.getElementById("show-time").value.trim());
    formData.append("ticketPrice", document.getElementById("show-price").value);
    formData.append("type", document.getElementById("show-type").value);
    formData.append("image", document.getElementById("show-image").files[0]);

    try {
        const response = await fetch('/admin/add-show', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData
        });

        if (response.ok) {
            alert("Show added successfully!");
            loadSystemStatus();
        } else {
            alert("Failed to add the show. Please try again.");
        }
    } catch (error) {
        console.error("Error adding show:", error);
    }
}

// Function to display shows (admin only)
function displayShowList() {
    const showList = document.getElementById("show-list");
    showList.innerHTML = "";

    movies.forEach((movie) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            ${movie.title} - Type: ${movie.type} - Showtimes: ${movie.showtimes.join(", ")} - Price: $${movie.ticketPrice}
            <button onclick="removeShow(${movie.id})">Remove</button>
        `;
        showList.appendChild(listItem);
    });
}

// Function to remove a show (admin only)
async function removeShow(showId) {
try {
    const response = await fetch(`/admin/remove-show/${showId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` },
    });

    if (response.ok) {
        alert("Show removed successfully!");
        fetchMovies();
        displayShowList();
    } else {
        alert("Failed to remove the show. Please try again.");
    }
} catch (error) {
    console.error("Error removing show:", error);
}
}

// Initialize admin page
async function initializeAdminPage() {
// Ensure user is an admin
const isAdmin = localStorage.getItem("isAdmin") === "true";
if (!isAdmin) {
    alert("Unauthorized access!");
    window.location.href = "login.html";
    return;
}

// Load admin-specific functionality
await fetchMovies();
loadSystemStatus();
displayShowList();

// Attach event listener for add show form
document.getElementById("add-show-form").addEventListener("submit", addShow);
}

// ------------------     --------------------------

// Display Movies based on type (current or upcoming)
function displayMovies(type = "current") {
    const movieList = document.getElementById("movie-list");
    if (movieList) {
        movieList.innerHTML = "";

        const filteredMovies = movies.filter(movie => movie.type === type);
        filteredMovies.forEach(movie => {
            const movieCard = document.createElement("div");
            movieCard.className = "movie-card";
            movieCard.innerHTML = `
                <a href="movie-details.html?id=${movie.id}">
                    <h3>${movie.title}</h3>
                    <p>${movie.synopsis}</p>
                    <p>Showtimes: ${movie.showtimes.join(", ")}</p>
                </a>
                ${type === "current" ? `<button onclick="bookTicket(${movie.id})">Book Ticket</button>` : "<p>Coming Soon</p>"}
            `;
            movieList.appendChild(movieCard);
        });
    }
}


// Function to load and display reviews
function loadReviews(movieId) {
    const reviews = JSON.parse(localStorage.getItem(`reviews-${movieId}`)) || [];
    const reviewsContainer = document.getElementById("reviews-list");

    reviewsContainer.innerHTML = "";

    reviews.forEach(review => {
        const reviewItem = document.createElement("div");
        reviewItem.className = "review";
        reviewItem.innerHTML = `<p>${review}</p>`;
        reviewsContainer.appendChild(reviewItem);
    });
}

//
function displayMovieDetails() {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    if (!movieId) {
        document.getElementById("movie-details-section").innerHTML = "<p>Movie not found.</p>";
        return;
    }

    // Fetch movie details from the server
    fetch(`/movies`)
        .then((response) => response.json())
        .then((movies) => {
            const movie = movies.find((m) => m.id == movieId);

            if (!movie) {
                document.getElementById("movie-details-section").innerHTML = "<p>Movie not found.</p>";
                return;
            }

            // Populate the movie details
            document.getElementById("movie-title").textContent = movie.title;
            document.getElementById("movie-synopsis").textContent = movie.synopsis;
            document.getElementById("movie-type").textContent = movie.type;

            const movieImage = document.getElementById("movie-image");
            movieImage.src = movie.image;
            movieImage.alt = movie.title;

            // Display showtimes
            const showtimesContainer = document.getElementById("movie-showtimes");
            showtimesContainer.innerHTML = movie.showtimes
                .map((showtime) => {
                    return `<input type="radio" name="showtime" value="${showtime}" id="showtime-${showtime}">
                            <label for="showtime-${showtime}">${showtime}</label>`;
                })
                .join("");

            document.getElementById("book-ticket-btn").style.display =
                movie.type === "current" ? "block" : "none";
        })
        .catch((error) => {
            console.error("Error fetching movie details:", error);
            document.getElementById("movie-details-section").innerHTML =
                "<p>Failed to load movie details.</p>";
        });
}

//
function logoutUser(event) {
    event.preventDefault();

    // Clear the token from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("loggedInUser");

    // Clear the token cookie on the server
    fetch('/logout', {
        method: 'POST',
    })
    .then((response) => {
        if (response.ok) {
            alert("Logged out successfully!");
            // Redirect to the login page
            window.location.href = "login.html";
        } else {
            alert("Failed to log out. Please try again.");
        }
    })
    .catch((error) => {
        console.error("Logout error:", error);
        alert("An error occurred. Please try again.");
    });
}


// Function to handle user or admin login
function loginUser(event) {
event.preventDefault();

const email = document.getElementById("username").value.trim();
const password = document.getElementById("password").value.trim();

fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
})
    .then(async (response) => {
        if (response.ok) {
            const data = await response.json();

            // Save token and admin status in localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("isAdmin", data.isAdmin);
            localStorage.setItem("loggedInUser", data.email);

            // Redirect based on role
            if (data.isAdmin) {
                alert("Welcome, Admin!");
                window.location.href = "admin.html";
            } else {
                alert("Welcome, User!");
                window.location.href = "home.html";
            }
        } else {
            document.getElementById("login-message").textContent = "Invalid email or password. Please try again.";
            document.getElementById("login-message").style.display = "block";
        }
    })
    .catch((error) => {
        console.error("Login error:", error);
        document.getElementById("login-message").textContent = "An error occurred. Please try again later.";
        document.getElementById("login-message").style.display = "block";
    });
}

//
async function registerUser(event) {
    event.preventDefault(); // Prevent page reload on form submission

    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("register-password").value.trim();

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                address,
                phone,
                password,
            }),
        });

        if (response.ok) {
            alert("Registration successful! Redirecting to login...");
            window.location.href = "login.html";
        } else {
            const errorData = await response.json();
            document.getElementById("register-message").textContent =
                errorData.message || "Registration failed. Please try again.";
            document.getElementById("register-message").style.display = "block";
        }
    } catch (error) {
        console.error("Error during registration:", error);
        document.getElementById("register-message").textContent =
            "An error occurred. Please try again later.";
        document.getElementById("register-message").style.display = "block";
    }
}

// Function to fetch movies from the server
async function fetchMovies() {
try {
    const response = await fetch('/movies');
    movies = await response.json();
} catch (error) {
    console.error("Error fetching movies:", error);
}
}