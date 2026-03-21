const tenantService = require('../services/tenantService');

async function createTenant(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    const tenant = await tenantService.createTenant(name);
    res.status(201).json(tenant);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Tenant already exists' });
    }
    next(err);
  }
}

async function listTenants(req, res, next) {
  try {
    const tenants = await tenantService.listTenants();
    res.json(tenants);
  } catch (err) {
    next(err);
  }
}

module.exports = { createTenant, listTenants };
