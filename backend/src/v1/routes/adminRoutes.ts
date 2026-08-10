import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateJwt } from '../../middleware/authMiddleware';
import { requireRoles } from '../../middleware/permissionMiddleware';
import { validateRequest } from '../../middleware/zodValidator';
import { rejectApplicationSchema, createStaffUserSchema } from '../validators/adminValidator';

const router = Router();

router.use(authenticateJwt);
router.use(requireRoles('ADMIN', 'SUPER_ADMIN'));

/**
 * @openapi
 * /admin/create-user:
 *   post:
 *     summary: Create Administrator or Field Surveyor User with Mandatory Zonal Location (SUPER_ADMIN / ADMIN)
 *     tags: [Admin Workflow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, mobile, gender, password, roleCode, stateId]
 *             properties:
 *               firstName: { type: string, example: "Vikram" }
 *               lastName: { type: string, example: "Singh" }
 *               mobile: { type: string, example: "9812345678" }
 *               gender: { type: string, enum: ["MALE", "FEMALE", "OTHER"], example: "MALE" }
 *               password: { type: string, example: "Password@123" }
 *               roleCode: { type: string, enum: ["ADMIN", "SURVEYOR", "CMS_USER"], example: "SURVEYOR" }
 *               stateId: { type: integer, example: 1 }
 *               districtId: { type: integer, example: 1 }
 *               blockId: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: User created with assigned zonal location.
 */
router.post(
  '/create-user',
  validateRequest({ body: createStaffUserSchema }),
  AdminController.createStaffUser
);

/**
 * @openapi
 * /admin/pending-applications:
 *   get:
 *     summary: Retrieve All Pending Beneficiary Applications (SUBMITTED status)
 *     tags: [Admin Workflow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending beneficiary applications with full profile, address, family members, and documents.
 */
router.get('/pending-applications', AdminController.getPendingApplications);

/**
 * @openapi
 * /admin/approve-beneficiary/{userId}:
 *   post:
 *     summary: Approve Beneficiary Application & Generate 8-Digit Alphanumeric Survey Number
 *     tags: [Admin Workflow]
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
 *         description: Beneficiary application approved and 8-digit survey number generated.
 */
router.post('/approve-beneficiary/:userId', AdminController.approveBeneficiary);

/**
 * @openapi
 * /admin/reject-beneficiary/{userId}:
 *   post:
 *     summary: Reject Beneficiary Application with Rejection Reason
 *     tags: [Admin Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectApplicationInput'
 *     responses:
 *       200:
 *         description: Beneficiary application rejected.
 */
router.post(
  '/reject-beneficiary/:userId',
  validateRequest({ body: rejectApplicationSchema }),
  AdminController.rejectBeneficiary
);

export default router;
