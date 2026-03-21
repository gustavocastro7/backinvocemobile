const { db } = require('../config/database');

async function tenantResolver(req, res, next) {
  const tenantId = req.headers['x-tenant-id'];

  if (!tenantId) {
    return res.status(400).json({ error: 'x-tenant-id header is required' });
  }

  try {
    const tenant = await db('public.tenants').where('id', tenantId).first();

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    req.tenant = tenant;
    req.schemaName = tenant.schema_name;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = tenantResolver;
