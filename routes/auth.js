import Router from 'express';
import { login, logout, register, showSigninPage, showSignupPage } from '../controllers/authController.js';

const router = Router();

router.get('/signin', showSigninPage);
router.get('/signup', showSignupPage);

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);

export default router;