-- Update document status enums to support REVISION and standardize CEO waiting statuses
-- Fast-boot approach: keep existing values, just add new allowed values and (optionally) migrate data.
-- Target DB: MySQL / MariaDB

-- IMPORTANT:
-- - If your columns are ENUM, this migration is required to store new statuses.
-- - If your columns are VARCHAR, you may skip schema changes and only do data updates.
--
-- This migration is intentionally non-destructive (no DROP TABLE).

START TRANSACTION;

-- 1) Notulensi: use REVISION, remove REJECTED
UPDATE lead_notulensi
SET status = 'REVISION'
WHERE status = 'REJECTED';

ALTER TABLE lead_notulensi
  MODIFY status ENUM('DRAFT','WAITING_CEO_APPROVAL','REVISION','APPROVED')
  NOT NULL DEFAULT 'DRAFT';

-- 2) Proposal: use REVISION, remove REJECTED
UPDATE lead_proposals
SET status = 'REVISION'
WHERE status = 'REJECTED';

ALTER TABLE lead_proposals
  MODIFY status ENUM(
    'DRAFT',
    'WAITING_APPROVAL',
    'WAITING_CEO_APPROVAL',
    'REVISION',
    'APPROVED',
    'SENT',
    'ACCEPTED',
    'PROPOSAL_EXPIRED'
  ) NOT NULL DEFAULT 'DRAFT';

-- 3) Engagement Letter: use REVISION, remove REJECTED (keep SIGNED)
UPDATE lead_engagement_letters
SET status = 'REVISION'
WHERE status = 'REJECTED';

ALTER TABLE lead_engagement_letters
  MODIFY status ENUM('DRAFT','WAITING_APPROVAL','REVISION','APPROVED','SENT','SIGNED')
  NOT NULL DEFAULT 'DRAFT';

-- 4) Handover: use REVISION, remove REJECTED
UPDATE lead_handovers
SET status = 'REVISION'
WHERE status = 'REJECTED';

ALTER TABLE lead_handovers
  MODIFY status ENUM('DRAFT','WAITING_CEO_APPROVAL','REVISION','APPROVED','SENT_TO_PM','CONVERTED')
  NOT NULL DEFAULT 'DRAFT';

COMMIT;
