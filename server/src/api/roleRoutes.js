import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as roleController from '../controllers/roleController.js';

const router = express.Router();

router.use(authenticateToken, requireRole('SUPER_ADMIN'));

router.get('/', roleController.listRoles);
router.post('/', roleController.createRole);
router.get('/:id', roleController.getRoleById);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);
router.put('/:id/permissions', roleController.updateRolePermissions);

export default router;


