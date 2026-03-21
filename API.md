# Mobile Invoice API Documentation

## Overview

Multi-tenant REST API for managing mobile phone invoices. Accepts TXT invoice files (e.g., Claro telecom invoices), parses them, and stores structured data in PostgreSQL.

**Base URL:** `http://localhost:3000/api`
**Swagger UI:** `http://localhost:3000/api-docs`

## Authentication / Multi-Tenancy

All invoice endpoints require the `x-tenant-id` header with a valid tenant UUID.

```
x-tenant-id: <tenant-uuid>
```

---

## Endpoints

### Health Check

```
GET /api/health
```

Returns `{ "status": "ok", "timestamp": "..." }`

---

### Tenants

#### Create Tenant

```
POST /api/tenants
Content-Type: application/json

{ "name": "USAFLEX" }
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "USAFLEX",
  "schema_name": "tenant_usaflex",
  "created_at": "2026-01-01T00:00:00.000Z"
}
```

#### List Tenants

```
GET /api/tenants
```

**Response (200):** Array of tenant objects.

---

### Invoices

All invoice endpoints require `x-tenant-id` header.

#### Upload Invoice (TXT file)

```
POST /api/invoices/upload
Content-Type: multipart/form-data
x-tenant-id: <tenant-uuid>

file: <invoice.txt>
```

Parses the TXT file and stores: invoice header data, tax information, and line items (calls, services, discounts).

**Response (201):** Full invoice object with `taxes` and `items` arrays.

#### List Invoices

```
GET /api/invoices?page=1&limit=20
x-tenant-id: <tenant-uuid>
```

**Response (200):**
```json
{
  "data": [ { "id": "...", "client_name": "...", "total_value": 7819.19, ... } ],
  "pagination": { "page": 1, "limit": 20, "total": 50, "pages": 3 }
}
```

#### Get Invoice by ID

```
GET /api/invoices/:id
x-tenant-id: <tenant-uuid>
```

**Response (200):** Invoice with `taxes` and `items` arrays.

#### Update Invoice

```
PUT /api/invoices/:id
Content-Type: application/json
x-tenant-id: <tenant-uuid>

{
  "client_name": "Updated Name",
  "total_value": 8000.00,
  "taxes": [ { "fiscal_note": "...", "tax_type": "PIS", "rate": 0.65, "base_value": 5000, "tax_value": 32.50 } ],
  "items": [ { "phone_number": "51 99287-8246", "section": "...", "charged_value": -49.99 } ]
}
```

Updatable fields: `client_name`, `client_address`, `client_code`, `reference_period_start`, `reference_period_end`, `due_date`, `total_value`, `auto_debit_id`, `filter`.

If `taxes` or `items` arrays are provided, they fully replace existing records.

**Response (200):** Updated invoice with taxes and items.

#### Delete Invoice

```
DELETE /api/invoices/:id
x-tenant-id: <tenant-uuid>
```

**Response (204):** No content.

#### Download Original File

```
GET /api/invoices/:id/original
x-tenant-id: <tenant-uuid>
```

**Response (200):** Original TXT file as `text/plain`.

---

## Data Model

### Invoice

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| client_name | string | Company name |
| client_address | string | Full address |
| client_code | string | Customer code ("Na Cliente") |
| reference_period_start | date | Billing period start |
| reference_period_end | date | Billing period end |
| due_date | date | Payment due date |
| total_value | decimal | Total invoice amount |
| auto_debit_id | string | Auto debit identification |
| filter | string | Filter applied |
| original_file | text | Raw TXT file content |

### Invoice Tax

| Field | Type | Description |
|-------|------|-------------|
| fiscal_note | string | Fiscal note reference |
| tax_type | string | PIS, COFINS, ICMS, etc. |
| rate | decimal | Tax rate percentage |
| base_value | decimal | Calculation base |
| tax_value | decimal | Tax amount |

### Invoice Item

| Field | Type | Description |
|-------|------|-------------|
| phone_number | string | Phone line |
| section | string | Service section/description |
| date | date | Item date |
| time | string | Item time |
| origin_destination | string | Origin/destination info |
| called_number | string | Called number |
| duration_quantity | string | Duration or quantity |
| rate | decimal | Unit rate |
| value | decimal | Gross value |
| charged_value | decimal | Net charged value |
| name | string | Contact name |
| cost_center | string | Cost center |
| registration | string | Employee registration |
| sub_section | string | Sub-section |
| tax_type | string | Tax classification |
| description | string | Item description |

---

## Running

```bash
docker-compose up --build
```

API available at `http://localhost:3000/api`
Swagger docs at `http://localhost:3000/api-docs`
