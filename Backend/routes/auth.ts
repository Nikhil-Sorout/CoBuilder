import { Router } from 'express';
import { signup, verifyEmail, login, googleAuth, exchangeCode } from '../controllers/auth';

const router = Router();

// POST /auth/signup - Sign up a new user
router.post('/signup', signup);

// GET /auth/verify-email - Verify email using token
router.get('/verify-email', verifyEmail);

// POST /auth/login - Login user
router.post('/login', login);

// POST /auth/google - Google OAuth authentication
router.post('/google', googleAuth);

// POST /auth/exchange-code - Exchange code for tokens
router.post('/exchange-code', exchangeCode);

export default router;
