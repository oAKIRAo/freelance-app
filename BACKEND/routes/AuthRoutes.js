import express from 'express';
import { LoginUser, RegisterUser,ResetPassword} from '../Controller/AuthentificationController.js';
const router = express.Router();
router.post('/register', RegisterUser);
router.post('/login', LoginUser);
router.post('/Reset-password', ResetPassword);
export default router;
