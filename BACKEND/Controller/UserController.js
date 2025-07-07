import User from "../models/UserModel.js";
export const CreateUser = async (req, res) => {
    try {
      const newUser = req.body;
  
      if (!newUser.name || !newUser.email || !newUser.password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
      }
  
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
    try {
      const user = await User.getById(req.params.id);
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
