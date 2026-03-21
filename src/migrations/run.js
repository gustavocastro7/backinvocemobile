const { db } = require('../config/database');

async function runMigrations() {
  // Create public tenants table
  const hasTenants = await db.schema.withSchema('public').hasTable('tenants');
  if (!hasTenants) {
    await db.schema.withSchema('public').createTable('tenants', (table) => {
      table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.string('schema_name').notNullable().unique();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Created tenants table');
  }
}

async function createTenantSchema(schemaName) {
  await db.raw(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

  const hasInvoices = await db.schema.withSchema(schemaName).hasTable('invoices');
  if (!hasInvoices) {
    await db.schema.withSchema(schemaName).createTable('invoices', (table) => {
      table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
      table.text('client_name');
      table.text('client_address');
      table.string('client_code');
      table.date('reference_period_start');
      table.date('reference_period_end');
      table.date('due_date');
      table.decimal('total_value', 12, 2);
      table.string('auto_debit_id');
      table.text('original_file');
      table.string('filter');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });

    await db.schema.withSchema(schemaName).createTable('invoice_taxes', (table) => {
      table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
      table.uuid('invoice_id').notNullable().references('id').inTable(`${schemaName}.invoices`).onDelete('CASCADE');
      table.string('fiscal_note');
      table.string('tax_type');
      table.decimal('rate', 6, 2);
      table.decimal('base_value', 12, 2);
      table.decimal('tax_value', 12, 2);
    });

    await db.schema.withSchema(schemaName).createTable('invoice_items', (table) => {
      table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
      table.uuid('invoice_id').notNullable().references('id').inTable(`${schemaName}.invoices`).onDelete('CASCADE');
      table.string('phone_number');
      table.string('section');
      table.date('date');
      table.string('time');
      table.string('origin_destination');
      table.string('called_number');
      table.string('duration_quantity');
      table.decimal('rate', 12, 4);
      table.decimal('value', 12, 2);
      table.decimal('charged_value', 12, 2);
      table.string('name');
      table.string('cost_center');
      table.string('registration');
      table.string('sub_section');
      table.string('tax_type');
      table.text('description');
      table.string('position');
      table.string('origin_location');
      table.string('destination_location');
      table.string('origin_code');
      table.string('destination_code');
    });

    console.log(`Created tenant schema: ${schemaName}`);
  }
}

module.exports = { runMigrations, createTenantSchema };
