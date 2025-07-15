import express, { json } from 'express';
import userRoutes from './routes/UserRoutes.js';
import AuthRoutes from './routes/AuthRoutes.js';
import PlaninngRoutes from './routes/PlanningRoutes.js';
import AppointmentRoutes from './routes/AppointmentRoutes.js';
import AvailabilityRoutes from './routes/AvailabilityRoutes.js';
import dotenv from 'dotenv';
import './DATABASE/init.js'
import cors from 'cors';
import{createAdminIfNotExists} from './utils/initAdmin.js'
dotenv.config();
const app = express();
app.use(cors({
  origin: 'http://localhost:5173', //FRONTEND adress
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH' ,'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});
app.use('/api/availability', AvailabilityRoutes);
app.use('/api/auth',AuthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/planning', PlaninngRoutes);
app.use('/api/appointment', AppointmentRoutes);
app.use('/uploads/profile_pictures', express.static('uploads/profile_pictures'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createAdminIfNotExists();
});
