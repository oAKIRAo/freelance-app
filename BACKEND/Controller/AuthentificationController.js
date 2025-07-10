
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from "../models/UserModel.js";
import { emailRegex, passwordRegex } from '../utils/validation.js';


// Register a new user
export const RegisterUser = async (req, res) => {
  try {
    const { name, email, password , role , specialty , price_per_hour} = req.body;
    const validRoles = ['client', 'freelancer'];

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'Name, email,password, and role are required' });

    if (!validRoles.includes(role)) 
      {
     throw new Error('Invalid role , meust be client or freelancer');
      }
//Verification d'email
    if (!emailRegex.test(email))
      return res.status(400).json({ message: 'Invalid email format' });
//Respect des criteres du mdp 
    if (!passwordRegex.test(password))
      return res.status(400).json({ message: 'Password must be at least 6 characters, contain at least 1 letter and 1 number' });
//Filtrage des champ pour chaque role 
    if(role == 'freelancer') 
       if(!specialty || !price_per_hour)
        return res.status(400).json({message: 'Speciality and price_per_hour are required for a freelancer '})
    if(role == 'client')
       if(specialty || price_per_hour)
        return res.status(400).json({message: 'Clients should not provide specialty or price_per_hour'})

    await User.register({ name, email, password ,role , specialty , price_per_hour});
    
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
