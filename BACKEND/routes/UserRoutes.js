import express from 'express';
import authMiddleware from '../Middleware/authMiddleware.js';
import adminMiddleware from '../Middleware/AdminMiddleware.js';
import { CreateUser, deleteUser, getAllUsers, updateUser,getUserByspecialty ,UpdateProfile, getUserById, getAllClients, getAllFreelancers} from '../Controller/UserController.js';
import ClientMiddleware from '../Middleware/ClientMiddleware.js';

const router = express.Router();
router.get('/',authMiddleware,adminMiddleware,getAllUsers);
router.post('/create',authMiddleware,adminMiddleware,CreateUser);
router.patch('/update/:id',authMiddleware,adminMiddleware,updateUser);
router.delete('/delete/:id',authMiddleware,adminMiddleware,deleteUser)
router.get('/searchByspec',authMiddleware,ClientMiddleware,getUserByspecialty);
router.patch('/updateProfile', authMiddleware, UpdateProfile);
router.get('/profile', authMiddleware,getUserById);
router.get('/clients',authMiddleware,adminMiddleware,getAllClients);
router.get('/freelancers',authMiddleware,adminMiddleware,getAllFreelancers);
export default router;
