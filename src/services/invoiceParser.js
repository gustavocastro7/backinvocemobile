function parseDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return null;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function parseNumber(str) {
  if (!str || str.trim() === '') return null;
  const cleaned = str.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseInvoiceTxt(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const result = {
    client_name: null,
    client_address: null,
    client_code: null,
    reference_period_start: null,
    reference_period_end: null,
    due_date: null,
    total_value: null,
    auto_debit_id: null,
    filter: null,
    taxes: [],
    items: [],
  };

  let headerLineIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Client name is typically the first non-empty line
    if (i === 0) {
      result.client_name = line.replace(/\s*-\s*$/, '').trim();
      continue;
    }

    // Client code
    if (line.startsWith('Na Cliente:')) {
      result.client_code = line.replace('Na Cliente:', '').trim();
      // Address is everything between client name and client code line
      const addressParts = [];
      for (let j = 1; j < i; j++) {
        addressParts.push(lines[j]);
      }
      result.client_address = addressParts.join(', ');
      continue;
    }

    // Reference period
    const periodMatch = line.match(/Per[íiao]+do de Refer[êeao]+ncia:\s*(\d{2}\/\d{2}\/\d{4})\s*a\s*(\d{2}\/\d{2}\/\d{4})/i);
    if (periodMatch) {
      result.reference_period_start = parseDate(periodMatch[1]);
      result.reference_period_end = parseDate(periodMatch[2]);
      continue;
    }

    // Due date and filter
    const dueDateMatch = line.match(/Data de Vencimento:\s*(\d{2}\/\d{2}\/\d{4})/i);
    if (dueDateMatch) {
      result.due_date = parseDate(dueDateMatch[1]);
      const filterMatch = line.match(/Filtro:\s*(.*)/i);
      if (filterMatch) {
        result.filter = filterMatch[1].trim();
      }
      continue;
    }

    // Total value
    const valorMatch = line.match(/^Valor:\s*R\$\s*([\d.,]+)/i);
    if (valorMatch) {
      result.total_value = parseNumber(valorMatch[1]);
      continue;
    }

    // Tax lines (e.g. "Nota Fiscal Claro:001529702/122025:71 PIS: Aliquota: 0,65 ...")
    const taxMatch = line.match(/^Nota Fiscal (.+?)\s+(PIS|COFINS|ICMS|ISS|FUST|FUNTTEL):\s*Aliquota:\s*([\d.,]+)\s*Base de Calculo:\s*([\d.,]+)\s*Valor Imposto:\s*([\d.,]+)/i);
    if (taxMatch) {
      result.taxes.push({
        fiscal_note: taxMatch[1].trim(),
        tax_type: taxMatch[2].trim(),
        rate: parseNumber(taxMatch[3]),
        base_value: parseNumber(taxMatch[4]),
        tax_value: parseNumber(taxMatch[5]),
      });
      continue;
    }

    // Financial document line
    const finDocMatch = line.match(/^Nota Fiscal (.+?)\s*Documento Financeiro:\s*Aliquota:\s*([\d.,]+)\s*Base de Calculo:\s*([\d.,]+)\s*Valor Imposto:\s*([\d.,]+)/i);
    if (finDocMatch) {
      result.taxes.push({
        fiscal_note: finDocMatch[1].trim(),
        tax_type: 'Documento Financeiro',
        rate: parseNumber(finDocMatch[2]),
        base_value: parseNumber(finDocMatch[3]),
        tax_value: parseNumber(finDocMatch[4]),
      });
      continue;
    }

    // Auto debit
    const debitMatch = line.match(/Identifica[cçao]+o para d[eéao]bito autom[aá]tico:\s*(\d+)/i);
    if (debitMatch) {
      result.auto_debit_id = debitMatch[1];
      continue;
    }

    // CSV header line detection
    if (line.startsWith('Tel;')) {
      headerLineIndex = i;
      continue;
    }

    // Parse detail rows (after header)
    if (headerLineIndex >= 0 && line.includes(';')) {
      const fields = line.split(';');
      if (fields.length >= 10) {
        const item = {
          phone_number: fields[0] || null,
          section: fields[1] || null,
          date: parseDate(fields[2]),
          time: fields[3] || null,
          origin_destination: fields[4] || null,
          called_number: fields[5] || null,
          duration_quantity: fields[6] || null,
          rate: parseNumber(fields[7]),
          value: parseNumber(fields[8]),
          charged_value: parseNumber(fields[9]),
          name: fields[10] || null,
          cost_center: fields[11] || null,
          registration: fields[12] || null,
          sub_section: fields[13] || null,
          tax_type: fields[14] || null,
          description: fields[15] || null,
          position: fields[16] || null,
          origin_location: fields[17] || null,
          destination_location: fields[18] || null,
          origin_code: fields[19] || null,
          destination_code: fields[20] || null,
        };
        result.items.push(item);
      }
    }
  }

  return result;
}

module.exports = { parseInvoiceTxt };
