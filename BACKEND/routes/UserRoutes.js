import express from 'express';
import authMiddleware from '../Middleware/authMiddleware.js';
import { CreateUser, deleteUser, getAllUsers, updateUser } from '../Controller/UserController.js';

const router = express.Router();
router.get('/profile', authMiddleware, (req, res) => {
  res.json({ message: `Welcome, user ID: ${req.user.id}` });
});
router.get('/',authMiddleware,getAllUsers);
router.post('/create',authMiddleware, CreateUser);
router.patch('/update/:id',authMiddleware,updateUser);
router.delete('/delete/:id',authMiddleware,deleteUser)


export default router;
