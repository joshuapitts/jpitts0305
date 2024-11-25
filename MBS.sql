CREATE DATABASE mbs;

USE mbs;

-- Table: User_Info
CREATE TABLE User_Info (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15)
);

-- Table: Billing_Info
CREATE TABLE Billing_Info (
    billing_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_number CHAR(16) NOT NULL,
    expiration_date CHAR(5) NOT NULL,
    cvv CHAR(3) NOT NULL,
    billing_address TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User_Info(user_id) ON DELETE CASCADE
);

CREATE TABLE Movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    synopsis TEXT NOT NULL,
    showtimes TEXT NOT NULL,
    ticketPrice DECIMAL(10, 2) NOT NULL,
    type ENUM('current', 'upcoming') NOT NULL,
    ticketsSold INT DEFAULT 0,
    image VARCHAR(255) NOT NULL
);

CREATE TABLE Ticket_History (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, 
    movie_id INT NOT NULL, 
    movie_title VARCHAR(255) NOT NULL,
    showtime VARCHAR(50) NOT NULL, 
    seats INT NOT NULL, 
    ticket_number VARCHAR(255) UNIQUE NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User_Info(user_id) ON DELETE CASCADE, 
    FOREIGN KEY (movie_id) REFERENCES Movies(id) ON DELETE CASCADE 
);

CREATE TABLE Reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    review TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User_Info(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movies(id) ON DELETE CASCADE
);


/* INSERT INTO Movies (title, synopsis, showtimes, ticketPrice, type, ticketsSold, image)
VALUES
('Wicked', 
 'Misunderstood because of her green skin, a young woman named Elphaba forges an unlikely but profound friendship with Glinda, a student with an unflinching desire for popularity. Following an encounter with the Wizard of Oz, their relationship soon reaches a crossroad as their lives begin to take very different paths.',
 '["12-03-25 - 3:00 PM", "12-03-25 - 6:00 PM"]', 
 10.00, 
 'current', 
 0, 
 'assets/wicked_pic.jpg'),

('Moana 2', 
 'Moana journeys to the far seas of Oceania after receiving an unexpected call from her wayfinding ancestors.',
 '["12-04-25 - 4:00 PM", "12-05-25 - 5:00 PM"]', 
 10.00, 
 'current', 
 0, 
 'assets/moana2_pic.jpg'),

('Red One', 
 'When a villain kidnaps Santa Claus from the North Pole, an E.L.F. (Extremely Large and Formidable) operative joins forces with the world\'s most accomplished tracker to find him and save Christmas.',
 '["12-06-25 - 3:00 PM", "12-06-25 - 7:00 PM"]', 
 10.00, 
 'current', 
 0, 
 'assets/redone_pic.jpg'),

('Gladiator II', 
 'Years after witnessing the death of Maximus at the hands of his uncle, Lucius must enter the Colosseum after the powerful emperors of Rome conquer his home. With rage in his heart and the future of the empire at stake, he looks to the past to find the strength and honor needed to return the glory of Rome to its people.',
 '["12-03-25 - 2:00 PM", "12-03-25 - 4:00 PM"]', 
 10.00, 
 'current', 
 0, 
 'assets/gladiator.jpg'),

('Pushpa 2: The Rule', 
 'The clash is on as Pushpa and Bhanwar Singh continue their rivalry in this epic conclusion to the two-parted action drama.',
 '["12-04-25 - :00 PM", "12-05-25 - 4:00 PM"]', 
 10.00, 
 'current', 
 0, 
 'assets/pushpa.jpg'),

('Venom: The Last Dance', 
 'Eddie Brock and Venom must make a devastating decision as they\'re pursued by a mysterious military man and alien monsters from Venom\'s home world.',
 '["Coming Soon"]', 
 10.00, 
 'upcoming', 
 0, 
 'assets/venom.jpg'),

('Smile 2', 
 'About to embark on a new world tour, global pop sensation Skye Riley begins to experience increasingly terrifying and inexplicable events. Overwhelmed by the escalating horrors and pressures of fame, she must face her dark past to regain control of her life before it spirals out of control.',
 '["Coming Soon"]', 
 10.00, 
 'upcoming', 
 0, 
 'assets/smile2.jpg'),

('The Wild Robot', 
 'Shipwrecked on a deserted island, a robot named Roz must learn to adapt to its new surroundings. Building relationships with the native animals, Roz soon develops a parental bond with an orphaned gosling.',
 '["Coming Soon"]', 
 10.00, 
 'upcoming', 
 0, 
 'assets/wildrobot.jpg'),

('Beetlejuice Beetlejuice', 
 'After a family tragedy, three generations of the Deetz family return home to Winter River. Still haunted by Beetlejuice, Lydia\'s life is turned upside down',
 '["Coming Soon"]', 
 10.00, 
 'upcoming', 
 0, 
 'assets/beetlejuice.jpg'),

('Anora', 
 'Anora, a sex worker from Brooklyn, gets her chance at a Cinderella story when she meets and marries the son of an oligarch. Once the news reaches Russia, her fairytale is threatened as the parents set out for New York to get the marriage annulled.',
 '["Coming Soon"]', 
 10.00, 
 'upcoming', 
 0, 
 'assets/anora.jpg'); */








-- USE THE BELOW TO ADD YOUR EMAIL AS ADMIN INTO TABLE
-- ALTER TABLE User_Info ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
-- UPDATE User_Info SET is_admin = TRUE WHERE email = '';
/* UPDATE User_Info
SET is_admin = 1
WHERE email = '';*/


-- DELETE FROM Movies WHERE id BETWEEN 1 AND 20;
-- ALTER TABLE Movies AUTO_INCREMENT = 1;



-- SELECT * FROM User_Info;
