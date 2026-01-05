# API Documentation - DSK Global ERP

Base URL: `http://localhost:3000` (atau sesuai dengan PORT di `.env`)

Semua endpoint (kecuali `/auth/*`) memerlukan authentication token di header:
```
Authorization: Bearer <token>
```

---

## 1. CAMPAIGNS API

### GET /campaigns
**Description:** Get all campaigns

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-string",
      "name": "Campaign Name",
      "type": "SOCIAL_MEDIA",
      "channel": "INSTAGRAM",
      "topic_tag": "TAX",
      "date_start": "2025-01-01",
      "date_end": "2025-12-31",
      "notes": "Campaign notes",
      "status": "ACTIVE",
      "created_by": "username",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /campaigns/:id
**Description:** Get campaign by ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "id": "uuid-string",
    "name": "Campaign Name",
    "type": "SOCIAL_MEDIA",
    "channel": "INSTAGRAM",
    "topic_tag": "TAX",
    "date_start": "2025-01-01",
    "date_end": "2025-12-31",
    "notes": "Campaign notes",
    "status": "ACTIVE",
    "created_by": "username",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### POST /campaigns
**Description:** Create new campaign

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Summer Campaign 2025",
  "type": "SOCIAL_MEDIA",
  "channel": "INSTAGRAM",
  "topic_tag": "TAX",
  "date_start": "2025-06-01",
  "date_end": "2025-08-31",
  "notes": "Summer promotion campaign",
  "status": "ACTIVE"
}
```

**Valid values:**
- `type`: `SOCIAL_MEDIA`, `FREEBIE`, `EVENT`
- `channel`: `INSTAGRAM`, `LINKEDIN`, `WEBSITE`, `SEMINAR`, `WEBINAR`, `BREVET`
- `status`: `ACTIVE`, `PAUSED`, `ENDED`

**Response (201):**
```json
{
  "message": "Campaign berhasil dibuat",
  "data": {
    "id": "generated-uuid",
    "name": "Summer Campaign 2025",
    "type": "SOCIAL_MEDIA",
    "channel": "INSTAGRAM",
    "topic_tag": "TAX",
    "date_start": "2025-06-01",
    "date_end": "2025-08-31",
    "notes": "Summer promotion campaign",
    "status": "ACTIVE",
    "created_by": "username",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### PUT /campaigns/:id
**Description:** Update campaign

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (semua field optional):**
```json
{
  "name": "Updated Campaign Name",
  "status": "PAUSED",
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "message": "Campaign berhasil diupdate",
  "data": {
    "id": "uuid-string",
    "name": "Updated Campaign Name",
    "type": "SOCIAL_MEDIA",
    "channel": "INSTAGRAM",
    "status": "PAUSED",
    "notes": "Updated notes",
    ...
  }
}
```

---

### DELETE /campaigns/:id
**Description:** Delete campaign

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Campaign berhasil dihapus"
}
```

---

## 2. FORMS API

### GET /forms
**Description:** Get all forms

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-string",
      "title": "Registration Form",
      "description": "Form description",
      "status": "PUBLISHED",
      "public_link": "https://example.com/form/xxx",
      "published_at": "2025-01-01T00:00:00.000Z",
      "created_by": "username",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z",
      "primary_campaign_id": "campaign-uuid"
    }
  ]
}
```

---

### GET /forms/:id
**Description:** Get form by ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "id": "uuid-string",
    "title": "Registration Form",
    "description": "Form description",
    "status": "PUBLISHED",
    "public_link": "https://example.com/form/xxx",
    "published_at": "2025-01-01T00:00:00.000Z",
    "created_by": "username",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "primary_campaign_id": "campaign-uuid"
  }
}
```

---

### POST /forms
**Description:** Create new form

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "New Registration Form",
  "description": "Form untuk registrasi",
  "status": "DRAFT",
  "public_link": "https://example.com/form/new",
  "published_at": null,
  "primary_campaign_id": "campaign-uuid"
}
```

**Valid values:**
- `status`: `DRAFT`, `PUBLISHED`

**Response (201):**
```json
{
  "message": "Form berhasil dibuat",
  "data": {
    "id": "generated-uuid",
    "title": "New Registration Form",
    "description": "Form untuk registrasi",
    "status": "DRAFT",
    ...
  }
}
```

---

### PUT /forms/:id
**Description:** Update form

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Updated Form Title",
  "status": "PUBLISHED",
  "published_at": "2025-01-01T00:00:00.000Z"
}
```

---

### DELETE /forms/:id
**Description:** Delete form

**Headers:**
```
Authorization: Bearer <token>
```

---

## 3. FORM FIELDS API

### GET /form-fields?form_id=xxx
**Description:** Get all form fields (with options)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `form_id` (optional): Filter by form ID

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "form_id": "form-uuid",
      "field_key": "full_name",
      "type": "SHORT_TEXT",
      "label": "Nama Lengkap",
      "required": true,
      "is_core": true,
      "placeholder": "Masukkan nama lengkap",
      "sort_order": 1,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z",
      "options": []
    },
    {
      "id": 2,
      "form_id": "form-uuid",
      "field_key": "service_type",
      "type": "DROPDOWN",
      "label": "Jenis Layanan",
      "required": true,
      "is_core": false,
      "placeholder": null,
      "sort_order": 2,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z",
      "options": [
        {
          "id": 1,
          "form_field_id": 2,
          "opt_order": 0,
          "opt_value": "TAX"
        },
        {
          "id": 2,
          "form_field_id": 2,
          "opt_order": 1,
          "opt_value": "AUDIT"
        }
      ]
    }
  ]
}
```

---

### GET /form-fields/:id
**Description:** Get form field by ID (with options)

**Headers:**
```
Authorization: Bearer <token>
```

---

### POST /form-fields
**Description:** Create new form field (with options)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "form_id": "form-uuid",
  "field_key": "company_size",
  "type": "RADIO",
  "label": "Ukuran Perusahaan",
  "required": true,
  "is_core": false,
  "placeholder": null,
  "sort_order": 3,
  "options": [
    { "opt_value": "Small (< 50 employees)" },
    { "opt_value": "Medium (50-200 employees)" },
    { "opt_value": "Large (> 200 employees)" }
  ]
}
```

**Valid values:**
- `type`: `SHORT_TEXT`, `LONG_TEXT`, `DROPDOWN`, `RADIO`, `CHECKBOX`, `DATE`

**Response (201):**
```json
{
  "message": "Form field berhasil dibuat",
  "data": {
    "id": 3,
    "form_id": "form-uuid",
    "field_key": "company_size",
    "type": "RADIO",
    "label": "Ukuran Perusahaan",
    "required": true,
    "is_core": false,
    "placeholder": null,
    "sort_order": 3,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "options": [
      {
        "id": 3,
        "form_field_id": 3,
        "opt_order": 0,
        "opt_value": "Small (< 50 employees)"
      },
      ...
    ]
  }
}
```

---

### PUT /form-fields/:id
**Description:** Update form field (with options)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "label": "Updated Label",
  "required": false,
  "options": [
    { "opt_value": "Option 1" },
    { "opt_value": "Option 2" }
  ]
}
```

**Note:** Jika `options` disertakan, semua options lama akan dihapus dan diganti dengan yang baru.

---

### DELETE /form-fields/:id
**Description:** Delete form field

**Headers:**
```
Authorization: Bearer <token>
```

---

## 4. CAMPAIGN FORMS API

### GET /campaign-forms?campaign_id=xxx&form_id=xxx
**Description:** Get campaign-form relationships

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `campaign_id` (optional): Filter by campaign ID
- `form_id` (optional): Filter by form ID

**Response:**
```json
{
  "data": [
    {
      "campaign_id": "campaign-uuid",
      "form_id": "form-uuid"
    }
  ]
}
```

---

### POST /campaign-forms
**Description:** Create campaign-form relationship

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "campaign_id": "campaign-uuid",
  "form_id": "form-uuid"
}
```

**Response (201):**
```json
{
  "message": "Campaign form berhasil dibuat",
  "data": {
    "campaign_id": "campaign-uuid",
    "form_id": "form-uuid"
  }
}
```

---

### DELETE /campaign-forms/:campaign_id/:form_id
**Description:** Delete campaign-form relationship

**Headers:**
```
Authorization: Bearer <token>
```

**URL Example:** `DELETE /campaign-forms/abc-123-uuid/xyz-789-uuid`

---

## 5. BANK DATA ENTRIES API

### GET /bank-data-entries
**Description:** Get all bank data entries

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `campaign_id` (optional): Filter by campaign ID
- `form_id` (optional): Filter by form ID
- `triage_status` (optional): Filter by status
- `limit` (optional): Limit results
- `offset` (optional): Offset for pagination

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-string",
      "campaign_id": "campaign-uuid",
      "form_id": "form-uuid",
      "client_name": "PT Example",
      "pic_name": "John Doe",
      "email": "john@example.com",
      "phone": "081234567890",
      "source_channel": "INSTAGRAM",
      "campaign_name": "Summer Campaign",
      "topic_tag": "TAX",
      "triage_status": "RAW_NEW",
      "extra_answers": {
        "custom_field_1": "value1",
        "custom_field_2": "value2"
      },
      "notes": "Notes here",
      "cleaned_by": null,
      "cleaned_at": null,
      "rejected_by": null,
      "rejected_at": null,
      "rejected_reason": null,
      "promoted_to_lead_id": null,
      "promoted_by": null,
      "promoted_at": null,
      "submitted_at": "2025-01-01T00:00:00.000Z",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /bank-data-entries/:id
**Description:** Get bank data entry by ID

**Headers:**
```
Authorization: Bearer <token>
```

---

### POST /bank-data-entries
**Description:** Create new bank data entry

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "campaign_id": "campaign-uuid",
  "form_id": "form-uuid",
  "client_name": "PT Example",
  "pic_name": "John Doe",
  "email": "john@example.com",
  "phone": "081234567890",
  "source_channel": "INSTAGRAM",
  "campaign_name": "Summer Campaign 2025",
  "topic_tag": "TAX",
  "triage_status": "RAW_NEW",
  "extra_answers": {
    "company_size": "Large",
    "industry": "Manufacturing",
    "budget": "50000000"
  },
  "notes": "Interested in tax services",
  "submitted_at": "2025-01-15T10:30:00.000Z"
}
```

**Valid values:**
- `source_channel`: `INSTAGRAM`, `LINKEDIN`, `WEBSITE`, `SEMINAR`, `WEBINAR`, `BREVET`
- `triage_status`: `RAW_NEW`, `REJECTED`, `PROMOTED_TO_LEAD`

**Response (201):**
```json
{
  "message": "Bank data entry berhasil dibuat",
  "data": {
    "id": "generated-uuid",
    "campaign_id": "campaign-uuid",
    "form_id": "form-uuid",
    "client_name": "PT Example",
    ...
  }
}
```

---

### PUT /bank-data-entries/:id
**Description:** Update bank data entry

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (semua field optional):**
```json
{
  "triage_status": "PROMOTED_TO_LEAD",
  "promoted_by": "username",
  "promoted_at": "2025-01-16T09:00:00.000Z",
  "promoted_to_lead_id": "lead-uuid",
  "notes": "Promoted to lead"
}
```

**Atau untuk reject:**
```json
{
  "triage_status": "REJECTED",
  "rejected_by": "username",
  "rejected_at": "2025-01-16T09:00:00.000Z",
  "rejected_reason": "Invalid contact information"
}
```

---

### DELETE /bank-data-entries/:id
**Description:** Delete bank data entry

**Headers:**
```
Authorization: Bearer <token>
```

---

## ERROR RESPONSES

### 400 Bad Request
```json
{
  "message": "name, type, channel, dan status wajib diisi"
}
```

### 401 Unauthorized
```json
{
  "message": "Token tidak valid atau kadaluarsa"
}
```

### 404 Not Found
```json
{
  "message": "Campaign tidak ditemukan"
}
```

### 409 Conflict
```json
{
  "message": "Campaign code sudah digunakan"
}
```

### 500 Internal Server Error
```json
{
  "message": "Terjadi kesalahan pada server"
}
```

