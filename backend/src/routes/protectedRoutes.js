import { Router } from 'express';
import { isAuthenticated } from '../middleware/authMiddleware';

const router = Router();

router.get('/dashboard', isAuthenticated, (req, res) => {
  res.json({ message: 'Welcome to your dashboard!' });
});

export default router;