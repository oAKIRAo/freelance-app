import db from '../DATABASE/Connection.js';
//User table creation script
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
//Planning table creation script
const createPlanningTableQuery = `
    CREATE TABLE IF NOT EXISTS planning_freelance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      freelancer_id INT NOT NULL,
      day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      foreign key (freelancer_id) references users(id) ON DELETE CASCADE
    );
`;
//On verifie l'existence de la table  
db.query(createPlanningTableQuery, (err, result) => {
  if (err) {
    console.error('Error creating planning_freelance table:', err.message);
  } else {
    console.log('planning_freelance table is ready.');
  }
});
//Appoinemet Table creation script
const createAppointmentTableQuery = `
  CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    freelancer_id INT NOT NULL,
    client_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('booked', 'canceled', 'completed') DEFAULT 'booked',
    FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
  );
`;
//On verifie l'existence de la table
db.query(createAppointmentTableQuery, (err, result) => {
  if (err) {
    console.error('Error creating appointments table:', err.message);
  } else {
    console.log('Appointments table is ready.');
  }
});