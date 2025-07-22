import User from "../models/UserModel.js";
import bcrypt from 'bcrypt';
export const CreateUser = async (req, res) => {
    try {
      const newUser = req.body;
      const validRoles = ['client', 'freelancer'];

      if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
        return res.status(400).json({ message: 'Name, email, password and role are required.' });
      }
      if (!validRoles.includes(newUser.role)) 
      {
     throw new Error('Invalid role , must be client or freelancer');
      }
      if(newUser.role == 'freelancer') 
       if(!newUser.specialty || !newUser.price_per_hour)
        return res.status(400).json({message: 'Speciality and price_per_hour are required for a freelancer '})
      if(newUser.role == 'client')
       if(newUser.specialty || newUser.price_per_hour)
        return res.status(400).json({message: 'Clients should not provide specialty or price_per_hour'})
      const result = await User.create(newUser);
      res.status(201).json({ message: 'User created', userId: result.insertId });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
}
export const getAllUsers = async (req, res) => {
    try {
      const users = await User.getAll();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
export const getUserById = async (req, res) => {
  const userId = req.user.id; 
    try {
      const user = await User.getById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
export const updateUser = async (req, res) => {
    try {
      const result = await User.update(req.params.id, req.body);
      res.status(200).json({ message: 'User updated', result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
export const deleteUser = async (req, res) => {
    try {
      const result = await User.delete(req.params.id);
      res.status(200).json({ message: 'User deleted', result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
export const getUserByspecialty = async (req, res) => {
   const { specialty } = req.query;
    if (!specialty) {
        return res.status(400).json({ message: 'Specialty is required' });
      }
    try {
      const users = await User.searchFreelancerByspecialty(specialty);
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
export const UpdateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, specialty, price_per_hour, password } = req.body;

  const fieldsToUpdate = {};

  if (name?.trim()) fieldsToUpdate.name = name.trim();
  if (email?.trim()) fieldsToUpdate.email = email.trim();
  if (specialty?.trim()) fieldsToUpdate.specialty = specialty.trim();
  if (price_per_hour) fieldsToUpdate.price_per_hour = price_per_hour;

  if (password && password.trim() !== "") {
    try {
      const hashed = await bcrypt.hash(password, 10);
      fieldsToUpdate.password = hashed;
    } catch (hashErr) {
      console.error("Password hashing failed:", hashErr);
      return res.status(500).json({ error: "Password hashing failed" });
    }
  }

  if (Object.keys(fieldsToUpdate).length === 0) {
    return res.status(400).json({ error: "No valid fields provided to update" });
  }

  try {
    const result = await User.update(userId, fieldsToUpdate);
    res.status(200).json({ message: "Profile updated", result });
  } catch (err) {
    console.error("UpdateProfile error:", err);
    res.status(500).json({ error: err.message });
  }
};

