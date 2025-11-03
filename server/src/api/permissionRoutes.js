import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as permissionController from '../controllers/permissionController.js';

const router = express.Router();

router.use(authenticateToken, requireRole('SUPER_ADMIN'));

router.get('/', permissionController.listPermissions);
router.post('/', permissionController.createPermission);
router.get('/:id', permissionController.getPermissionById);
router.put('/:id', permissionController.updatePermission);
router.delete('/:id', permissionController.deletePermission);

export default router;


