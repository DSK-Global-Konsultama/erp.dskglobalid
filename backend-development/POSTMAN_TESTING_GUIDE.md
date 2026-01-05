# Panduan Testing API dengan Postman

## Persiapan

1. **Login untuk mendapatkan token**
   - Endpoint: `POST /auth/login`
   - Body:
     ```json
     {
       "username": "superadmin",
       "password": "password"
     }
     ```
   - Copy token dari response

2. **Setup Environment di Postman**
   - Buat Environment baru dengan nama "DSK ERP Local"
   - Tambahkan variable:
     - `base_url`: `http://localhost:3000`
     - `token`: (paste token dari login)

3. **Setup Collection**
   - Buat Collection baru: "DSK Global ERP API"
   - Set Collection Authorization Type: Bearer Token
   - Set Token: `{{token}}`

---

## Testing Sequence (Urutan Testing)

### 1. CAMPAIGNS

#### 1.1 Create Campaign
```
POST {{base_url}}/d
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "name": "Test Campaign 2025",
  "type": "SOCIAL_MEDIA",
  "channel": "INSTAGRAM",
  "topic_tag": "TAX",
  "date_start": "2025-01-01",
  "date_end": "2025-12-31",
  "notes": "Test campaign untuk pengujian",
  "status": "ACTIVE"
}
```
**Expected:** Status 201, copy `id` dari response untuk testing selanjutnya

#### 1.2 Get All Campaigns
```
GET {{base_url}}/campaigns
Headers:
  Authorization: Bearer {{token}}
```
**Expected:** Status 200, array of campaigns

#### 1.3 Get Campaign by ID
```
GET {{base_url}}/campaigns/{{campaign_id}}
Headers:
  Authorization: Bearer {{token}}
```
**Expected:** Status 200, single campaign object

#### 1.4 Update Campaign
```
PUT {{base_url}}/campaigns/{{campaign_id}}
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "status": "PAUSED",
  "notes": "Updated notes"
}
```
**Expected:** Status 200, updated campaign

#### 1.5 Delete Campaign (skip jika masih digunakan)
```
DELETE {{base_url}}/campaigns/{{campaign_id}}
Headers:
  Authorization: Bearer {{token}}
```
**Expected:** Status 200, atau 409 jika masih digunakan

---

### 2. FORMS

#### 2.1 Create Form
```
POST {{base_url}}/forms
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "title": "Test Registration Form",
  "description": "Form untuk testing",
  "status": "DRAFT",
  "primary_campaign_id": "{{campaign_id}}"
}
```
**Expected:** Status 201, copy `id` untuk testing selanjutnya

#### 2.2 Get All Forms
```
GET {{base_url}}/forms
Headers:
  Authorization: Bearer {{token}}
```

#### 2.3 Get Form by ID
```
GET {{base_url}}/forms/{{form_id}}
Headers:
  Authorization: Bearer {{token}}
```

#### 2.4 Update Form
```
PUT {{base_url}}/forms/{{form_id}}
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "status": "PUBLISHED",
  "public_link": "https://example.com/form/test"
}
```

---

### 3. FORM FIELDS

#### 3.1 Create Form Field (Short Text)
```
POST {{base_url}}/form-fields
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "form_id": "{{form_id}}",
  "field_key": "full_name",
  "type": "SHORT_TEXT",
  "label": "Nama Lengkap",
  "required": true,
  "is_core": true,
  "placeholder": "Masukkan nama lengkap",
  "sort_order": 1,
  "options": []
}
```
**Expected:** Status 201

#### 3.2 Create Form Field (Dropdown dengan Options)
```
POST {{base_url}}/form-fields
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "form_id": "{{form_id}}",
  "field_key": "service_type",
  "type": "DROPDOWN",
  "label": "Jenis Layanan",
  "required": true,
  "is_core": false,
  "sort_order": 2,
  "options": [
    { "opt_value": "TAX" },
    { "opt_value": "AUDIT" },
    { "opt_value": "LEGAL" }
  ]
}
```
**Expected:** Status 201, field dengan options

#### 3.3 Get All Form Fields
```
GET {{base_url}}/form-fields?form_id={{form_id}}
Headers:
  Authorization: Bearer {{token}}
```
**Expected:** Status 200, array dengan options

#### 3.4 Get Form Field by ID
```
GET {{base_url}}/form-fields/{{form_field_id}}
Headers:
  Authorization: Bearer {{token}}
```

#### 3.5 Update Form Field
```
PUT {{base_url}}/form-fields/{{form_field_id}}
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "label": "Updated Label",
  "options": [
    { "opt_value": "New Option 1" },
    { "opt_value": "New Option 2" }
  ]
}
```

---

### 4. CAMPAIGN FORMS (Junction Table)

#### 4.1 Create Campaign-Form Relationship
```
POST {{base_url}}/campaign-forms
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "campaign_id": "{{campaign_id}}",
  "form_id": "{{form_id}}"
}
```
**Expected:** Status 201

#### 4.2 Get Campaign-Form Relationships
```
GET {{base_url}}/campaign-forms?campaign_id={{campaign_id}}
Headers:
  Authorization: Bearer {{token}}
```

#### 4.3 Delete Campaign-Form Relationship
```
DELETE {{base_url}}/campaign-forms/{{campaign_id}}/{{form_id}}
Headers:
  Authorization: Bearer {{token}}
```

---

### 5. BANK DATA ENTRIES

**PENTING:** Pastikan campaign-form relationship sudah dibuat sebelumnya!

#### 5.1 Create Bank Data Entry
```
POST {{base_url}}/bank-data-entries
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "campaign_id": "{{campaign_id}}",
  "form_id": "{{form_id}}",
  "client_name": "PT Test Company",
  "pic_name": "Budi Santoso",
  "email": "budi@testcompany.com",
  "phone": "081234567890",
  "source_channel": "INSTAGRAM",
  "campaign_name": "Test Campaign 2025",
  "topic_tag": "TAX",
  "triage_status": "RAW_NEW",
  "extra_answers": {
    "company_size": "Medium",
    "industry": "Technology",
    "budget": "25000000"
  },
  "notes": "Test entry",
  "submitted_at": "2025-01-15T10:30:00.000Z"
}
```
**Expected:** Status 201, copy `id` untuk testing selanjutnya

#### 5.2 Get All Bank Data Entries
```
GET {{base_url}}/bank-data-entries
Headers:
  Authorization: Bearer {{token}}
```

#### 5.3 Get Bank Data Entries with Filters
```
GET {{base_url}}/bank-data-entries?campaign_id={{campaign_id}}&triage_status=RAW_NEW&limit=10&offset=0
Headers:
  Authorization: Bearer {{token}}
```

#### 5.4 Get Bank Data Entry by ID
```
GET {{base_url}}/bank-data-entries/{{bank_data_entry_id}}
Headers:
  Authorization: Bearer {{token}}
```

#### 5.5 Update Bank Data Entry (Promote to Lead)
```
PUT {{base_url}}/bank-data-entries/{{bank_data_entry_id}}
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "triage_status": "PROMOTED_TO_LEAD",
  "promoted_by": "superadmin",
  "promoted_at": "2025-01-16T09:00:00.000Z",
  "promoted_to_lead_id": "lead-uuid-here",
  "notes": "Promoted to lead"
}
```

#### 5.6 Update Bank Data Entry (Reject)
```
PUT {{base_url}}/bank-data-entries/{{bank_data_entry_id}}
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "triage_status": "REJECTED",
  "rejected_by": "superadmin",
  "rejected_at": "2025-01-16T09:00:00.000Z",
  "rejected_reason": "Invalid email format"
}
```

#### 5.7 Update Bank Data Entry (Clean/Mark as Cleaned)
```
PUT {{base_url}}/bank-data-entries/{{bank_data_entry_id}}
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "cleaned_by": "superadmin",
  "cleaned_at": "2025-01-16T10:00:00.000Z",
  "notes": "Data sudah dibersihkan dan divalidasi"
}
```

---

## Testing Error Cases

### 1. Test Missing Required Fields
```
POST {{base_url}}/campaigns
Body:
{
  "name": "Test"
  // Missing: type, channel, status
}
```
**Expected:** Status 400

### 2. Test Invalid Enum Values
```
POST {{base_url}}/campaigns
Body:
{
  "name": "Test",
  "type": "INVALID_TYPE",
  "channel": "INSTAGRAM",
  "status": "ACTIVE"
}
```
**Expected:** Status 400

### 3. Test Invalid Foreign Key
```
POST {{base_url}}/bank-data-entries
Body:
{
  "campaign_id": "non-existent-id",
  "form_id": "non-existent-id",
  ...
}
```
**Expected:** Status 404 (Campaign form tidak ditemukan)

### 4. Test Unauthorized Access
```
GET {{base_url}}/campaigns
// Without Authorization header
```
**Expected:** Status 401

### 5. Test Duplicate Entry
```
POST {{base_url}}/campaign-forms
Body:
{
  "campaign_id": "{{campaign_id}}",
  "form_id": "{{form_id}}"
}
// Run twice
```
**Expected:** First request 201, second request 409

---

## Tips Postman

1. **Use Variables**
   - Set `campaign_id`, `form_id`, dll sebagai collection variables
   - Gunakan `{{variable_name}}` di URL dan body

2. **Tests Script (Optional)**
   - Di tab Tests, tambahkan script untuk auto-save IDs:
   ```javascript
   if (pm.response.code === 201) {
     const jsonData = pm.response.json();
     if (jsonData.data && jsonData.data.id) {
       pm.collectionVariables.set("campaign_id", jsonData.data.id);
     }
   }
   ```

3. **Pre-request Script**
   - Untuk auto-refresh token jika diperlukan

4. **Save Responses**
   - Save example responses untuk dokumentasi

---

## Quick Test Checklist

- [ ] Login dan dapatkan token
- [ ] Create campaign
- [ ] Create form
- [ ] Create campaign-form relationship
- [ ] Create form fields (dengan dan tanpa options)
- [ ] Create bank data entry
- [ ] Update bank data entry (promote/reject/clean)
- [ ] Test error cases
- [ ] Test pagination dan filtering
- [ ] Test delete operations

