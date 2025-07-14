
import db from '../DATABASE/Connection.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

//Methods
//CRUD User
const User = {
   findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null); //  user not  found
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
  //ReserPassword
  resetPassword: async (email, newPassword) => {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      const result = await new Promise((resolve, reject) => {
        db.query( 'UPDATE users SET password = ? WHERE email = ?',
          [hashedPassword, email],
          (err,result) => {
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
      
  getById: async (id) => {
    try {
      const [rows] = await db.promise().query(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows[0]; 
    } catch (err) {
      throw err;
    }
  },
create: async (user) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    const defaultPicture = 'default.jpg';

    const result = await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO users (name, email, password, role, specialty, price_per_hour, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.name, user.email, hashedPassword, user.role, user.specialty || null, user.price_per_hour || null , defaultPicture],
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
        const speciality = user.role == 'freelancer' ? user.specialty : null;
        const price_per_hour = user.role == 'freelancer' ? user.price_per_hour : null;
        const defaultPicture = 'default.jpg';
        const result = await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO users (name, email, password, role, specialty, price_per_hour, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user.name, user.email, hashedPassword,user.role, speciality, price_per_hour, defaultPicture ],
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