const { Router } = require('express');
const tenantController = require('../controllers/tenantController');

const router = Router();

/**
 * @swagger
 * /api/tenants:
 *   post:
 *     summary: Create a new tenant
 *     tags: [Tenants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "USAFLEX"
 *     responses:
 *       201:
 *         description: Tenant created
 *       409:
 *         description: Tenant already exists
 */
router.post('/', tenantController.createTenant);

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: List all tenants
 *     tags: [Tenants]
 *     responses:
 *       200:
 *         description: List of tenants
 */
router.get('/', tenantController.listTenants);

module.exports = router;
