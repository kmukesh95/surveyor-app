import { Router } from 'express';
import { BeneficiaryController } from '../controllers/beneficiaryController';
import { authenticateJwt } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/zodValidator';
import {
  updateProfileSchema,
  updateAddressSchema,
  addQualificationSchema,
} from '../validators/beneficiaryValidator';

const router = Router();

router.use(authenticateJwt);

/**
 * @openapi
 * /beneficiary/profile:
 *   put:
 *     summary: Update Beneficiary Profile Details (DRAFT or REJECTED state only)
 *     tags: [Beneficiary Module]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileInput'
 *     responses:
 *       200:
 *         description: Profile details updated successfully.
 */
router.put('/profile', validateRequest({ body: updateProfileSchema }), BeneficiaryController.updateProfile);

/**
 * @openapi
 * /beneficiary/address:
 *   put:
 *     summary: Update Household Address (DRAFT or REJECTED state only)
 *     tags: [Beneficiary Module]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAddressInput'
 *     responses:
 *       200:
 *         description: Household address details updated successfully.
 */
router.put('/address', validateRequest({ body: updateAddressSchema }), BeneficiaryController.updateAddress);

/**
 * @openapi
 * /beneficiary/qualifications:
 *   post:
 *     summary: Add Educational Qualification (DRAFT or REJECTED state only)
 *     tags: [Beneficiary Module]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qualificationId]
 *             properties:
 *               qualificationId: { type: string, example: "uuid-string" }
 *               passingYear: { type: integer, example: 2012 }
 *               boardUniversity: { type: string, example: "CBSE" }
 *               gradePercentage: { type: string, example: "85%" }
 *     responses:
 *       201:
 *         description: Qualification added successfully.
 */
router.post('/qualifications', validateRequest({ body: addQualificationSchema }), BeneficiaryController.addQualification);

/**
 * @openapi
 * /beneficiary/qualifications/{id}:
 *   delete:
 *     summary: Delete Educational Qualification Record
 *     tags: [Beneficiary Module]
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
 *         description: Qualification deleted successfully.
 */
router.delete('/qualifications/:id', BeneficiaryController.deleteQualification);

/**
 * @openapi
 * /beneficiary/submit:
 *   post:
 *     summary: Final Application Form Submission (Transitions DRAFT/REJECTED to SUBMITTED)
 *     tags: [Beneficiary Module]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application submitted to Administrator for verification.
 */
router.post('/submit', BeneficiaryController.submitApplication);

export default router;
