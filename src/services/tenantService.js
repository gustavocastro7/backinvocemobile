const { db } = require('../config/database');
const { createTenantSchema } = require('../migrations/run');

async function createTenant(name) {
  const schemaName = 'tenant_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const [tenant] = await db('public.tenants')
    .insert({ name, schema_name: schemaName })
    .returning('*');

  await createTenantSchema(schemaName);

  return tenant;
}

async function listTenants() {
  return db('public.tenants').select('*').orderBy('created_at', 'desc');
}

async function getTenantById(id) {
  return db('public.tenants').where('id', id).first();
}

module.exports = { createTenant, listTenants, getTenantById };
