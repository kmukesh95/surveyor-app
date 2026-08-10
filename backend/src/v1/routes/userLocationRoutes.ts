import { Router } from 'express';
import { UserLocationController } from '../controllers/userLocationController';
import { authenticateJwt } from '../../middleware/authMiddleware';
import { requireRoles } from '../../middleware/permissionMiddleware';
import { validateRequest } from '../../middleware/zodValidator';
import { assignLocationSchema } from '../validators/userLocationValidator';

const router = Router();

router.use(authenticateJwt);

/**
 * @openapi
 * /user-locations:
 *   post:
 *     summary: Assign State, District, or Block Zonal Jurisdiction to Admin / Field Surveyor
 *     tags: [Zonal Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignUserLocationInput'
 *     responses:
 *       201:
 *         description: Zonal location assigned to user successfully.
 */
router.post(
  '/',
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  validateRequest({ body: assignLocationSchema }),
  UserLocationController.assignLocation
);

/**
 * @openapi
 * /user-locations/user/{userId}:
 *   get:
 *     summary: Get Assigned Zonal Locations for a Specific User
 *     tags: [Zonal Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of assigned geographic zones retrieved.
 */
router.get('/user/:userId', UserLocationController.getUserLocations);

/**
 * @openapi
 * /user-locations/{id}:
 *   delete:
 *     summary: Remove/Delete Zonal Location Assignment
 *     tags: [Zonal Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Zonal location assignment removed.
 */
router.delete('/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), UserLocationController.deleteLocation);

export default router;
