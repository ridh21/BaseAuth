import { Router } from 'express';
import { 
  signup, 
  login, 
  verifyEmail, 
  googleAuth, 
  googleCallback,
  githubAuth, 
  githubCallback 
} from '../controllers/authController.js';

import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-email', verifyEmail);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// GitHub OAuth routes
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);

router.get('/verify', isAuthenticated, (req, res) => {
  res.json({ isAuthenticated : true, user: req.user });
});

export default router;
