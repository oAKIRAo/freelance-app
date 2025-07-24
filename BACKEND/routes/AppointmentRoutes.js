import express from 'express';
import{createAppointment, DeleteAppointment, GetAllappointent, GetStatusCount, updateAppointment} from '../Controller/AppointmentController.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import adminMiddleware from '../Middleware/AdminMiddleware.js'
import ClientMiddleware from '../Middleware/ClientMiddleware.js';
import FreelancerMiddleware from '../Middleware/FreelancerMiddlware.js';
import { CancelAppointment , CompleteAppointment} from '../Controller/AppointmentController.js';
import { getAllAppointmentsByFreelancer, getAllApointementsByClient } from '../Controller/AppointmentController.js';
const router = express.Router();
router.post('/create/:freelancerId', authMiddleware, ClientMiddleware, createAppointment);
router.patch('/:id/cancel', authMiddleware, CancelAppointment);
router.patch('/:id/complete',authMiddleware,CompleteAppointment);
router.get('/freelancer/appointments', authMiddleware, FreelancerMiddleware,getAllAppointmentsByFreelancer);
router.get('/client/appointments', authMiddleware,ClientMiddleware, getAllApointementsByClient);
router.get('/status/count',authMiddleware,adminMiddleware,GetStatusCount)
router.patch('/update/:id',authMiddleware,adminMiddleware,updateAppointment)
router.delete('/delete/:id',authMiddleware,adminMiddleware,DeleteAppointment)
router.get('/',authMiddleware,adminMiddleware,GetAllappointent)
export default router;