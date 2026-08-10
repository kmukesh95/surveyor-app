import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../../middleware/zodValidator';
import { authenticateJwt } from '../../middleware/authMiddleware';
import { requireRoles } from '../../middleware/permissionMiddleware';
import {
  directRegisterSchema,
  surveyorRegisterSchema,
  loginSchema,
  verify2faSchema,
} from '../validators/authValidator';

const router = Router();

/**
 * @openapi
 * /auth/register-direct:
 *   post:
 *     summary: Direct Self-Registration for Beneficiaries
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DirectRegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully.
 */
router.post('/register-direct', validateRequest({ body: directRegisterSchema }), AuthController.registerDirect);

/**
 * @openapi
 * /auth/register-surveyor:
 *   post:
 *     summary: Field Surveyor Registration of Household Beneficiary
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SurveyorRegisterInput'
 *     responses:
 *       201:
 *         description: Beneficiary household registered by Field Surveyor.
 */
router.post(
  '/register-surveyor',
  authenticateJwt,
  requireRoles('SURVEYOR', 'ADMIN', 'SUPER_ADMIN'),
  validateRequest({ body: surveyorRegisterSchema }),
  AuthController.registerSurveyor
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: User Login (Mobile / Email / Survey Number + Password)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful. Returns access and refresh JWT tokens.
 */
router.post('/login', validateRequest({ body: loginSchema }), AuthController.login);

/**
 * @openapi
 * /auth/verify-2fa:
 *   post:
 *     summary: Verify 6-Digit 2FA Code
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Verify2FAInput'
 *     responses:
 *       200:
 *         description: 2FA verified successfully.
 */
router.post('/verify-2fa', authenticateJwt, validateRequest({ body: verify2faSchema }), AuthController.verify2FA);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout & Revoke Session Token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully.
 */
router.post('/logout', authenticateJwt, AuthController.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get Authenticated User Profile & Full Household Data
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile and household details retrieved.
 */
router.get('/me', authenticateJwt, AuthController.getMe);

export default router;
