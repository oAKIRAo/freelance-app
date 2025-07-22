import express from 'express'
import {getAppointmentsAnalytics} from '../Controller/AnalyticsController.js'
import authMiddleware from '../Middleware/authMiddleware.js';
import adminMiddleware from '../Middleware/AdminMiddleware.js';
const router = express.Router();
router.get('/analytics',authMiddleware,adminMiddleware,getAppointmentsAnalytics);
export default router;