import express from 'express';
import authMiddleware from '../Middleware/authMiddleware.js';
import adminMiddleware from '../Middleware/AdminMiddleware.js';
import { CreateUser, deleteUser, getAllUsers, updateUser,getUserByspecialty } from '../Controller/UserController.js';
import ClientMiddleware from '../Middleware/ClientMiddleware.js';

const router = express.Router();
router.get('/profile', authMiddleware, (req, res) => {
  res.json({ message: `Welcome, user ID: ${req.user.id}` });
});
router.get('/',authMiddleware,adminMiddleware,getAllUsers);
router.post('/create',authMiddleware,adminMiddleware,CreateUser);
router.patch('/update/:id',authMiddleware,adminMiddleware,updateUser);
router.delete('/delete/:id',authMiddleware,adminMiddleware,deleteUser)
router.get('/searchByspec',authMiddleware,ClientMiddleware,getUserByspecialty);
export default router;
