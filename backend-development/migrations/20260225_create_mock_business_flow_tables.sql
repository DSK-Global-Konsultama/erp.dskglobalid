-- Full business flow tables based on frontend mock-data.ts types.
-- Target DB: MySQL / MariaDB
-- Notes:
-- - Uses leads(id) as the main root entity (already exists in this project).
-- - Adds deal/project/invoice/payment related tables.
-- - Adds richer columns for tracker docs (meetings/notulensi/proposal/EL/handover) beyond minimal meta-derivation.
-- - Keeps JSON payload columns for flexibility.

SET FOREIGN_KEY_CHECKS = 0;

-- Drop children first (safe re-run for dev). Remove DROP statements if you need non-destructive migrations in staging/prod.
DROP TABLE IF EXISTS invoice_payment_terms;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS deal_services;
DROP TABLE IF EXISTS deals;

DROP TABLE IF EXISTS lead_handovers;
DROP TABLE IF EXISTS lead_engagement_letters;
DROP TABLE IF EXISTS lead_proposals;
DROP TABLE IF EXISTS lead_notulensi;
DROP TABLE IF EXISTS lead_meetings;

SET FOREIGN_KEY_CHECKS = 1;

-- 1) Lead tracker documents
CREATE TABLE IF NOT EXISTS lead_meetings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lead_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NULL,
  date_time DATETIME NULL,
  location VARCHAR(255) NULL,
  status ENUM('SCHEDULED','DONE','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  notes TEXT NULL,
  summary TEXT NULL,
  created_by VARCHAR(150) NULL,
  updated_by VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lead_meetings_lead_id (lead_id),
  KEY idx_lead_meetings_date_time (date_time),
  CONSTRAINT fk_lead_meetings_lead_id FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lead_notulensi (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lead_id BIGINT UNSIGNED NOT NULL,
  meeting_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NULL,
  client_name VARCHAR(255) NULL,
  status ENUM('DRAFT','WAITING_CEO_APPROVAL','APPROVED','REJECTED') NOT NULL DEFAULT 'DRAFT',
  objectives TEXT NULL,
  next_steps TEXT NULL,
  notes TEXT NULL,
  payload JSON NULL,
  created_by VARCHAR(150) NULL,
  approved_by VARCHAR(150) NULL,
  approved_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lead_notulensi_lead_id (lead_id),
  KEY idx_lead_notulensi_meeting_id (meeting_id),
  KEY idx_lead_notulensi_status (status),
  CONSTRAINT fk_lead_notulensi_lead_id FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  CONSTRAINT fk_lead_notulensi_meeting_id FOREIGN KEY (meeting_id) REFERENCES lead_meetings(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lead_proposals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lead_id BIGINT UNSIGNED NOT NULL,
  client_name VARCHAR(255) NULL,
  service VARCHAR(255) NULL,
  proposal_fee DECIMAL(18,2) NULL,
  agree_fee DECIMAL(18,2) NULL,
  payment_type VARCHAR(100) NULL,
  payment_type_final VARCHAR(100) NULL,
  deal_date DATE NULL,
  has_subcon TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('DRAFT','WAITING_APPROVAL','WAITING_CEO_APPROVAL','APPROVED','SENT','ACCEPTED','PROPOSAL_EXPIRED','REJECTED') NOT NULL DEFAULT 'DRAFT',
  sent_at DATETIME NULL,
  file_url TEXT NULL,
  payload JSON NULL,
  created_by VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lead_proposals_lead_id (lead_id),
  KEY idx_lead_proposals_status (status),
  CONSTRAINT fk_lead_proposals_lead_id FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lead_engagement_letters (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lead_id BIGINT UNSIGNED NOT NULL,
  client_name VARCHAR(255) NULL,
  service VARCHAR(255) NULL,
  agree_fee DECIMAL(18,2) NULL,
  has_subcon TINYINT(1) NOT NULL DEFAULT 0,
  payment_type VARCHAR(100) NULL,
  payment_type_final VARCHAR(100) NULL,
  status ENUM('DRAFT','WAITING_APPROVAL','APPROVED','SENT','SIGNED','REJECTED') NOT NULL DEFAULT 'DRAFT',
  submitted_date DATETIME NULL,
  approved_date DATETIME NULL,
  sent_at DATETIME NULL,
  signed_date DATETIME NULL,
  file_url TEXT NULL,
  payload JSON NULL,
  created_by VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lead_engagement_letters_lead_id (lead_id),
  KEY idx_lead_engagement_letters_status (status),
  CONSTRAINT fk_lead_engagement_letters_lead_id FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lead_handovers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lead_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,
  client_name VARCHAR(255) NULL,
  project_title VARCHAR(255) NULL,
  pm VARCHAR(150) NULL,
  status ENUM('DRAFT','WAITING_CEO_APPROVAL','APPROVED','REJECTED','SENT_TO_PM','CONVERTED') NOT NULL DEFAULT 'DRAFT',
  summary TEXT NULL,
  deliverables JSON NULL,
  notes TEXT NULL,
  file_url TEXT NULL,
  sent_at DATETIME NULL,
  converted_at DATETIME NULL,
  payload JSON NULL,
  created_by VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lead_handovers_lead_id (lead_id),
  KEY idx_lead_handovers_status (status),
  CONSTRAINT fk_lead_handovers_lead_id FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- 2) Deal (from mock-data Deal)
CREATE TABLE IF NOT EXISTS deals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lead_id BIGINT UNSIGNED NOT NULL,
  client_name VARCHAR(255) NULL,
  company_name VARCHAR(255) NULL,
  total_deal_value DECIMAL(18,2) NULL,
  proposal_status ENUM('draft','submitted','approved') NOT NULL DEFAULT 'draft',
  proposal_submitted_date DATE NULL,
  proposal_approved_date DATE NULL,
  el_strategy ENUM('single','separate') NOT NULL DEFAULT 'single',
  bd_executive VARCHAR(150) NULL,
  created_date DATE NULL,
  client_needs TEXT NULL,
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_deals_lead_id (lead_id),
  KEY idx_deals_bd_executive (bd_executive),
  CONSTRAINT fk_deals_lead_id FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- Deal services (from mock-data Service[] on Deal)
CREATE TABLE IF NOT EXISTS deal_services (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  deal_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  estimated_value DECIMAL(18,2) NULL,
  el_id BIGINT UNSIGNED NULL,
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_deal_services_deal_id (deal_id),
  CONSTRAINT fk_deal_services_deal_id FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
);

-- 3) Project (from mock-data Project)
CREATE TABLE IF NOT EXISTS projects (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  deal_id BIGINT UNSIGNED NOT NULL,
  deal_service_id BIGINT UNSIGNED NULL,
  el_id BIGINT UNSIGNED NULL,
  project_name VARCHAR(255) NOT NULL,
  service_name VARCHAR(255) NULL,
  client_name VARCHAR(255) NULL,
  assigned_pm VARCHAR(150) NULL,
  assigned_consultant VARCHAR(150) NULL,
  status ENUM('waiting-assignment','waiting-pm','waiting-el','waiting-first-payment','in-progress','waiting-final-payment','completed') NOT NULL DEFAULT 'waiting-assignment',
  due_date DATE NULL,
  start_date DATE NULL,
  completion_date DATE NULL,
  pm_notified TINYINT(1) NOT NULL DEFAULT 0,
  progress_percentage INT NULL,
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_projects_deal_id (deal_id),
  KEY idx_projects_status (status),
  CONSTRAINT fk_projects_deal_id FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
);

-- Now that projects exists, add FK from handover.project_id (optional)
ALTER TABLE lead_handovers
  ADD CONSTRAINT fk_lead_handovers_project_id FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- 4) Invoice + Payment Terms (from mock-data Invoice & PaymentTerm)
CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  client_name VARCHAR(255) NULL,
  total_amount DECIMAL(18,2) NULL,
  created_date DATE NULL,
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_invoices_project_id (project_id),
  CONSTRAINT fk_invoices_project_id FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoice_payment_terms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  invoice_id BIGINT UNSIGNED NOT NULL,
  term_number INT NOT NULL,
  percentage DECIMAL(6,3) NULL,
  amount DECIMAL(18,2) NULL,
  description VARCHAR(255) NULL,
  status ENUM('pending','paid','overdue') NOT NULL DEFAULT 'pending',
  due_date DATE NULL,
  paid_date DATE NULL,
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_invoice_payment_terms_invoice_id (invoice_id),
  KEY idx_invoice_payment_terms_status (status),
  CONSTRAINT fk_invoice_payment_terms_invoice_id FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);
