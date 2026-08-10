import { Router } from 'express';
import { MasterController } from '../controllers/masterController';
import { validateRequest } from '../../middleware/zodValidator';
import { districtQuerySchema, blockQuerySchema } from '../validators/masterValidator';

const router = Router();

/**
 * @openapi
 * /master/roles:
 *   get:
 *     summary: Retrieve Master Roles
 *     tags: [Master Data]
 *     responses:
 *       200:
 *         description: List of master roles retrieved successfully.
 */
router.get('/roles', MasterController.getRoles);

/**
 * @openapi
 * /master/relations:
 *   get:
 *     summary: Retrieve Master Family Relations
 *     tags: [Master Data]
 *     responses:
 *       200:
 *         description: List of master family relations retrieved successfully.
 */
router.get('/relations', MasterController.getRelations);

/**
 * @openapi
 * /master/qualifications:
 *   get:
 *     summary: Retrieve Master Qualifications
 *     tags: [Master Data]
 *     responses:
 *       200:
 *         description: List of master qualifications retrieved successfully.
 */
router.get('/qualifications', MasterController.getQualifications);

/**
 * @openapi
 * /master/social-categories:
 *   get:
 *     summary: Retrieve Master Social Categories
 *     tags: [Master Data]
 *     responses:
 *       200:
 *         description: List of master social categories retrieved successfully.
 */
router.get('/social-categories', MasterController.getSocialCategories);

/**
 * @openapi
 * /master/states:
 *   get:
 *     summary: Retrieve Master States
 *     tags: [Master Data]
 *     responses:
 *       200:
 *         description: List of master states retrieved successfully.
 */
router.get('/states', MasterController.getStates);

/**
 * @openapi
 * /master/districts:
 *   get:
 *     summary: Retrieve Master Districts
 *     tags: [Master Data]
 *     parameters:
 *       - in: query
 *         name: stateId
 *         schema:
 *           type: integer
 *         description: Optional State ID filter
 *     responses:
 *       200:
 *         description: List of master districts retrieved successfully.
 */
router.get('/districts', validateRequest({ query: districtQuerySchema }), MasterController.getDistricts);

/**
 * @openapi
 * /master/blocks:
 *   get:
 *     summary: Retrieve Master Blocks
 *     tags: [Master Data]
 *     parameters:
 *       - in: query
 *         name: districtId
 *         schema:
 *           type: integer
 *         description: Optional District ID filter
 *     responses:
 *       200:
 *         description: List of master blocks retrieved successfully.
 */
router.get('/blocks', validateRequest({ query: blockQuerySchema }), MasterController.getBlocks);

export default router;
