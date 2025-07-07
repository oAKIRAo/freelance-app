import db from '../config/DataBase.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
//Creation de la table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
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
//Methods
//CRUD User
const User = {
   findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null); // No user found
        resolve(results[0]); // Return the found user
      });
    });
  },
  getAll: async () => {
    try {
      const [rows] = await db.promise().query('SELECT * FROM users');
      return rows;
    } catch (err) {
      throw err;
    }
  },
  getById: async (id) => {
    try {
      const [rows] = await db.promise().query(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows[0]; // single user
    } catch (err) {
      throw err;
    }
  },
    create: (user) => {
      return new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [user.name, user.email, user.password],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
    },
  
    update: async (id, fieldsToUpdate) => {
      const keys = Object.keys(fieldsToUpdate);
      const values = Object.values(fieldsToUpdate);
    
      const setClause = keys.map(key => `${key} = ?`).join(', ');
      values.push(id);
    
      return new Promise((resolve, reject) => {
        db.query(
          `UPDATE users SET ${setClause} WHERE id = ?`,
          values,
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
    },
    
    delete: async (id) => {
      try {
        const [result] = await db.promise().query(
          'DELETE FROM users WHERE id = ?',
          [id]
        );
        return result;
      } catch (err) {
        throw err;
      }
    },
//Aunthentification User
    register: async (user) => {
      try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        const result = await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [user.name, user.email, hashedPassword],
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
        });   
        return result; 
      } catch (error) {
        throw error;
      }
    },
    login: (email, password) => {
      return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
          if (err) return reject(err);
          if (results.length === 0) return reject(new Error('User not found'));
    
          const user = results[0];
          const match = await bcrypt.compare(password, user.password);
          if (!match) return reject(new Error('Incorrect password'));
    
          const token = jwt.sign(
            { id: user.id, email: user.email },     
            process.env.JWT_SECRET,                   
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' } 
          );
    
          resolve({ user, token });
        });
      });
    }
  
  };
  
  export default User;