import Router from 'express';
import { login, logout, register } from '../controllers/authController.js';

const router = Router();

router.get('/signin', (req, res) => res.render('signin', {
    session_username: req.session.user ? req.session.user.username : false,
    error: false
}));
router.post('/login', login);

router.get('/signup', (req, res) => res.render('signup', {
    session_username: req.session.user ? req.session.user.username : false,
    error: false
}));
router.post('/register', register);

router.post('/logout', logout);

export default router;