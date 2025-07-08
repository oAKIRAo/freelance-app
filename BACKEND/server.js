import express, { json } from 'express';
import userRoutes from './routes/UserRoutes.js';
import AuthRoutes from './routes/AuthRoutes.js';
import dotenv from 'dotenv';
import './DATABASE/init.js'
import{createAdminIfNotExists} from './utils/initAdmin.js'
dotenv.config();
const app = express();
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});
app.use('/api/auth',AuthRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads/profile_pictures', express.static('uploads/profile_pictures'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createAdminIfNotExists();
});
