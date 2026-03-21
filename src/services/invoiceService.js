const { db } = require('../config/database');
const { parseInvoiceTxt } = require('./invoiceParser');

function tenantTable(schema, table) {
  return db.withSchema(schema).table(table);
}

async function uploadInvoice(schemaName, fileContent) {
  const parsed = parseInvoiceTxt(fileContent);

  const [invoice] = await db.withSchema(schemaName)
    .insert({
      client_name: parsed.client_name,
      client_address: parsed.client_address,
      client_code: parsed.client_code,
      reference_period_start: parsed.reference_period_start,
      reference_period_end: parsed.reference_period_end,
      due_date: parsed.due_date,
      total_value: parsed.total_value,
      auto_debit_id: parsed.auto_debit_id,
      filter: parsed.filter,
      original_file: fileContent,
    })
    .into('invoices')
    .returning('*');

  if (parsed.taxes.length > 0) {
    const taxRows = parsed.taxes.map(t => ({ ...t, invoice_id: invoice.id }));
    await db.withSchema(schemaName).insert(taxRows).into('invoice_taxes');
  }

  if (parsed.items.length > 0) {
    const itemRows = parsed.items.map(item => ({ ...item, invoice_id: invoice.id }));
    // Insert in batches of 500
    for (let i = 0; i < itemRows.length; i += 500) {
      const batch = itemRows.slice(i, i + 500);
      await db.withSchema(schemaName).insert(batch).into('invoice_items');
    }
  }

  return getInvoiceById(schemaName, invoice.id);
}

async function listInvoices(schemaName, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const [countResult] = await db.withSchema(schemaName)
    .from('invoices')
    .count('id as total');

  const invoices = await db.withSchema(schemaName)
    .from('invoices')
    .select('id', 'client_name', 'client_code', 'reference_period_start', 'reference_period_end', 'due_date', 'total_value', 'created_at')
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  return {
    data: invoices,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: Number(countResult.total),
      pages: Math.ceil(Number(countResult.total) / limit),
    },
  };
}

async function getInvoiceById(schemaName, id) {
  const invoice = await db.withSchema(schemaName)
    .from('invoices')
    .where('id', id)
    .first();

  if (!invoice) return null;

  const taxes = await db.withSchema(schemaName)
    .from('invoice_taxes')
    .where('invoice_id', id);

  const items = await db.withSchema(schemaName)
    .from('invoice_items')
    .where('invoice_id', id);

  return { ...invoice, taxes, items };
}

async function updateInvoice(schemaName, id, data) {
  const allowedFields = [
    'client_name', 'client_address', 'client_code',
    'reference_period_start', 'reference_period_end',
    'due_date', 'total_value', 'auto_debit_id', 'filter',
  ];

  const updateData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  if (Object.keys(updateData).length === 0 && !data.taxes && !data.items) {
    return getInvoiceById(schemaName, id);
  }

  if (Object.keys(updateData).length > 0) {
    updateData.updated_at = db.fn.now();
    await db.withSchema(schemaName)
      .from('invoices')
      .where('id', id)
      .update(updateData);
  }

  // Replace taxes if provided
  if (data.taxes) {
    await db.withSchema(schemaName).from('invoice_taxes').where('invoice_id', id).del();
    if (data.taxes.length > 0) {
      const taxRows = data.taxes.map(t => ({ ...t, invoice_id: id }));
      await db.withSchema(schemaName).insert(taxRows).into('invoice_taxes');
    }
  }

  // Replace items if provided
  if (data.items) {
    await db.withSchema(schemaName).from('invoice_items').where('invoice_id', id).del();
    if (data.items.length > 0) {
      const itemRows = data.items.map(item => ({ ...item, invoice_id: id }));
      for (let i = 0; i < itemRows.length; i += 500) {
        const batch = itemRows.slice(i, i + 500);
        await db.withSchema(schemaName).insert(batch).into('invoice_items');
      }
    }
  }

  return getInvoiceById(schemaName, id);
}

async function deleteInvoice(schemaName, id) {
  const invoice = await db.withSchema(schemaName).from('invoices').where('id', id).first();
  if (!invoice) return false;

  await db.withSchema(schemaName).from('invoices').where('id', id).del();
  return true;
}

async function getOriginalFile(schemaName, id) {
  const invoice = await db.withSchema(schemaName)
    .from('invoices')
    .where('id', id)
    .select('original_file', 'client_name')
    .first();

  return invoice || null;
}

module.exports = {
  uploadInvoice,
  listInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getOriginalFile,
};
