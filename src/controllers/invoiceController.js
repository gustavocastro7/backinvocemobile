const invoiceService = require('../services/invoiceService');

async function upload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required. Send a .txt file in the "file" field.' });
    }

    const content = req.file.buffer.toString('utf-8');
    const invoice = await invoiceService.uploadInvoice(req.schemaName, content);
    res.status(201).json(invoice);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await invoiceService.listInvoices(req.schemaName, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const invoice = await invoiceService.getInvoiceById(req.schemaName, req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const existing = await invoiceService.getInvoiceById(req.schemaName, req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = await invoiceService.updateInvoice(req.schemaName, req.params.id, req.body);
    res.json(invoice);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await invoiceService.deleteInvoice(req.schemaName, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getOriginal(req, res, next) {
  try {
    const data = await invoiceService.getOriginalFile(req.schemaName, req.params.id);
    if (!data) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${req.params.id}.txt"`);
    res.send(data.original_file);
  } catch (err) {
    next(err);
  }
}

module.exports = { upload, list, getById, update, remove, getOriginal };
