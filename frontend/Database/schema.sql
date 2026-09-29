CREATE DATABASE IF NOT EXISTS estatex;

USE estatex;

-- 1. USERS
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('buyer', 'agent', 'admin') DEFAULT 'buyer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 2. AGENTS
CREATE TABLE agents (
    agent_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    agency_name VARCHAR(150),
    license_number VARCHAR(100),
    experience_years INT DEFAULT 0,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- 3. PROPERTIES
CREATE TABLE properties (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT NOT NULL,

    title VARCHAR(200) NOT NULL,
    description TEXT,
    property_type ENUM(
        'Apartment',
        'Villa',
        'House',
        'Plot',
        'Commercial'
    ) NOT NULL,

    listing_type ENUM('Sale', 'Rent') NOT NULL,

    price DECIMAL(15,2) NOT NULL,

    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) DEFAULT 'Hyderabad',

    bedrooms INT,
    bathrooms INT,
    area_sqft DECIMAL(10,2),

    status ENUM(
        'Available',
        'Sold',
        'Rented'
    ) DEFAULT 'Available',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (agent_id)
        REFERENCES agents(agent_id)
        ON DELETE CASCADE
);


-- 4. PROPERTY IMAGES
CREATE TABLE property_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE
);


-- 5. PROPERTY AMENITIES
CREATE TABLE property_amenities (
    amenity_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    amenity_name VARCHAR(100) NOT NULL,

    FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE
);


-- 6. VIRTUAL TOURS
CREATE TABLE virtual_tours (
    tour_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    tour_url VARCHAR(500) NOT NULL,
    viewer_type VARCHAR(50) DEFAULT '360',

    FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE
);


-- 7. FAVORITES
CREATE TABLE favorites (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, property_id),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE
);


-- 8. ENQUIRIES
CREATE TABLE enquiries (
    enquiry_id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    property_id INT NOT NULL,
    agent_id INT NOT NULL,

    message TEXT,
    status ENUM(
        'New',
        'Contacted',
        'Closed'
    ) DEFAULT 'New',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (buyer_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    FOREIGN KEY (agent_id)
        REFERENCES agents(agent_id)
        ON DELETE CASCADE
);


-- 9. LEADS
CREATE TABLE leads (
    lead_id INT AUTO_INCREMENT PRIMARY KEY,
    enquiry_id INT NOT NULL,
    agent_id INT NOT NULL,
    buyer_id INT NOT NULL,

    status ENUM(
        'New',
        'In Progress',
        'Converted',
        'Lost'
    ) DEFAULT 'New',

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (enquiry_id)
        REFERENCES enquiries(enquiry_id)
        ON DELETE CASCADE,

    FOREIGN KEY (agent_id)
        REFERENCES agents(agent_id)
        ON DELETE CASCADE,

    FOREIGN KEY (buyer_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- 10. PROPERTY VERIFICATION
CREATE TABLE property_verification (
    verification_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    admin_id INT NOT NULL,

    status ENUM(
        'Pending',
        'Verified',
        'Rejected'
    ) DEFAULT 'Pending',

    verification_notes TEXT,
    verified_at TIMESTAMP NULL,

    FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    FOREIGN KEY (admin_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);