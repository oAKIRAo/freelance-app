import mysql from "mysql2";
import dotenv from 'dotenv';
dotenv.config();

// First connect *without* specifying a database to create it if needed
const tempConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

tempConnection.connect((err) => {
  if (err) {
    console.error('Temp DB connection failed: ', err.stack);
    return;
  }
  // Create the database if it doesn't exist
  tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``, (err) => {
    if (err) {
      console.error('Error creating database:', err);
    } else {
      console.log(`Database "${process.env.DB_NAME}" is ready`);
    }
    tempConnection.end();
  });
});

// Your original connection (with database specified)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('DB connection failed: ', err.stack);
    return;
  }
  console.log('Connected to MySQL as ID ' + db.threadId);
});

export default db;
