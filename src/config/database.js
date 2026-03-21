const knex = require('knex');

const config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'invoice_user',
    password: process.env.DB_PASSWORD || 'invoice_pass',
    database: process.env.DB_NAME || 'invoice_db',
  },
  pool: { min: 2, max: 10 },
};

const db = knex(config);

async function setTenantSchema(db, schemaName) {
  await db.raw(`SET search_path TO "${schemaName}"`);
}

async function getTenantConnection(schemaName) {
  const tenantDb = knex(config);
  await tenantDb.raw(`SET search_path TO "${schemaName}"`);
  return tenantDb;
}

module.exports = { db, config, setTenantSchema, getTenantConnection };
