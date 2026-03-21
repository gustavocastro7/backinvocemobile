const { Router } = require('express');
const multer = require('multer');
const tenantResolver = require('../middleware/tenantResolver');
const invoiceController = require('../controllers/invoiceController');

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(tenantResolver);

/**
 * @swagger
 * /api/invoices/upload:
 *   post:
 *     summary: Upload and parse a TXT invoice file
 *     tags: [Invoices]
 *     parameters:
 *       - in: header
 *         name: x-tenant-id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Invoice created from file
 *       400:
 *         description: File is required
 */
router.post('/upload', upload.single('file'), invoiceController.upload);

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: List invoices with pagination
 *     tags: [Invoices]
 *     parameters:
 *       - in: header
 *         name: x-tenant-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of invoices
 */
router.get('/', invoiceController.list);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID with taxes and items
 *     tags: [Invoices]
 *     parameters:
 *       - in: header
 *         name: x-tenant-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice details
 *       404:
 *         description: Invoice not found
 */
router.get('/:id', invoiceController.getById);

/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     summary: Update invoice data
 *     tags: [Invoices]
 *     parameters:
 *       - in: header
 *         name: x-tenant-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_name:
 *                 type: string
 *               client_address:
 *                 type: string
 *               client_code:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *               total_value:
 *                 type: number
 *               taxes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fiscal_note:
 *                       type: string
 *                     tax_type:
 *                       type: string
 *                     rate:
 *                       type: number
 *                     base_value:
 *                       type: number
 *                     tax_value:
 *                       type: number
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     phone_number:
 *                       type: string
 *                     section:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                     charged_value:
 *                       type: number
 *     responses:
 *       200:
 *         description: Updated invoice
 *       404:
 *         description: Invoice not found
 */
router.put('/:id', invoiceController.update);

/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     summary: Delete an invoice
 *     tags: [Invoices]
 *     parameters:
 *       - in: header
 *         name: x-tenant-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Invoice deleted
 *       404:
 *         description: Invoice not found
 */
router.delete('/:id', invoiceController.remove);

/**
 * @swagger
 * /api/invoices/{id}/original:
 *   get:
 *     summary: Download the original TXT file
 *     tags: [Invoices]
 *     parameters:
 *       - in: header
 *         name: x-tenant-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Original TXT file
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: Invoice not found
 */
router.get('/:id/original', invoiceController.getOriginal);

module.exports = router;
