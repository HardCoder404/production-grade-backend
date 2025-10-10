import { Router } from 'express';
const router = Router();

// Import Routes 
import authRoutes from './auth';
import userRoutes from './user';

router.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'API is live', 
    version: '1.0.0',
    status: 'OK',
    timestamp: new Date().toISOString()
   });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;