import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();
router.use(authenticateToken);

router.post('/generate', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), reportController.getReportData);

export default router;
