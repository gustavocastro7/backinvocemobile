const { Router } = require('express');
const tenantRoutes = require('./tenantRoutes');
const invoiceRoutes = require('./invoiceRoutes');

const router = Router();

router.use('/tenants', tenantRoutes);
router.use('/invoices', invoiceRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
