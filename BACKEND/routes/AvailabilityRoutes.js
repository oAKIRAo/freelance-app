import express from 'express';
import { getAvailableSlots } from '../Controller/AvailabilityController.js';
import ClientMiddleware from '../Middleware/ClientMiddleware.js';
import authMiddleware from '../Middleware/authMiddleware.js';
const router = express.Router();
router.get('/:freelancerId/available-slots', authMiddleware,ClientMiddleware, getAvailableSlots);
export default router;