import { Router } from 'express';
import { FamilyController } from '../controllers/familyController';
import { validateRequest } from '../../middleware/zodValidator';
import { authenticateJwt } from '../../middleware/authMiddleware';
import { requireRoles } from '../../middleware/permissionMiddleware';
import { addFamilyMemberSchema, updateFamilyMemberSchema } from '../validators/familyValidator';

const router = Router();

router.use(authenticateJwt);

/**
 * @openapi
 * /family-members:
 *   post:
 *     summary: Add Household Family Member
 *     tags: [Family Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddFamilyMemberInput'
 *     responses:
 *       201:
 *         description: Family member added successfully.
 *   get:
 *     summary: Get Authenticated User Household Family Members List
 *     tags: [Family Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of household family members retrieved.
 */
router.post('/', validateRequest({ body: addFamilyMemberSchema }), FamilyController.addFamilyMember);
router.get('/', FamilyController.getFamilyMembers);

/**
 * @openapi
 * /family-members/{id}:
 *   get:
 *     summary: Get Family Member Details by ID
 *     tags: [Family Members]
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
 *         description: Family member details retrieved.
 *   put:
 *     summary: Update Family Member Details
 *     tags: [Family Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddFamilyMemberInput'
 *     responses:
 *       200:
 *         description: Family member details updated.
 *   delete:
 *     summary: Delete Family Member Record
 *     tags: [Family Members]
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
 *         description: Family member record deleted.
 */
router.get('/:id', FamilyController.getFamilyMemberById);
router.put('/:id', validateRequest({ body: updateFamilyMemberSchema }), FamilyController.updateFamilyMember);
router.delete('/:id', FamilyController.deleteFamilyMember);

/**
 * @openapi
 * /family-members/user/{userId}:
 *   get:
 *     summary: Get Household Family Members by Beneficiary User ID (Surveyor/Admin access)
 *     tags: [Family Members]
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
 *         description: Family members list retrieved.
 */
router.get('/user/:userId', requireRoles('SURVEYOR', 'ADMIN', 'SUPER_ADMIN'), FamilyController.getFamilyMembers);

export default router;
