import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from "../models/UserModel.js";

// Register a new user
export const RegisterUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required' });

    await User.register({ name, email, password });
    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login an existing user and return JWT token
export const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email); 
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign(
      { id: user.id, email: user.email},  
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token
    });

  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};
