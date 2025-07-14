import express from 'express';
import{createAppointment} from '../Controller/AppointmentController.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import ClientMiddleware from '../Middleware/ClientMiddleware.js';
const router = express.Router();
router.post('/create/:freelancerId', authMiddleware, ClientMiddleware, createAppointment);
export default router;