import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { authenticateJwt } from '../../middleware/authMiddleware';
import { uploadSingleDocument } from '../../middleware/uploadMiddleware';
import { requireRoles } from '../../middleware/permissionMiddleware';

const router = Router();

router.use(authenticateJwt);

/**
 * @openapi
 * /documents/upload:
 *   post:
 *     summary: Upload Document File & Create Media Entry (DRAFT/REJECTED state only)
 *     tags: [Documents & Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [document, docType]
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Document image or PDF file (Max 10MB)
 *               docType:
 *                 type: string
 *                 enum: [PROFILE_PHOTO, QUALIFICATION, IDENTITY_PROOF, RATION_CARD, VOTER_ID]
 *                 example: PROFILE_PHOTO
 *     responses:
 *       201:
 *         description: Document uploaded and linked to Media entry successfully.
 */
router.post('/upload', uploadSingleDocument, DocumentController.uploadDocument);

/**
 * @openapi
 * /documents:
 *   get:
 *     summary: Get Authenticated User Uploaded Documents List
 *     tags: [Documents & Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user uploaded documents with linked media info retrieved.
 */
router.get('/', DocumentController.getUserDocuments);

/**
 * @openapi
 * /documents/{id}:
 *   delete:
 *     summary: Soft Delete Document Record (DRAFT/REJECTED state only)
 *     tags: [Documents & Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Integer Document Primary Key ID
 *     responses:
 *       200:
 *         description: Document deleted successfully.
 */
router.delete('/:id', DocumentController.deleteDocument);

/**
 * @openapi
 * /documents/user/{userId}:
 *   get:
 *     summary: Get Beneficiary Documents by User ID (Surveyor/Admin access)
 *     tags: [Documents & Media]
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
 *         description: Documents list retrieved.
 */
router.get('/user/:userId', requireRoles('SURVEYOR', 'ADMIN', 'SUPER_ADMIN'), DocumentController.getUserDocuments);

export default router;
