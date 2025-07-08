import db from '../DATABASE/Connection.js';

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('client', 'freelancer', 'admin') NOT NULL,
    specialty VARCHAR(255) DEFAULT NULL, 
    price_per_hour DECIMAL(10,2) DEFAULT NULL,
    profile_picture VARCHAR(255) NOT NULL DEFAULT 'default.jpg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;
//On verifie l'existence de la table
db.query(createTableQuery, (err, result) => {
  if (err) {
    console.error('Error creating users table:', err.message);
  } else {
    console.log('Users table is ready.');
  }
});