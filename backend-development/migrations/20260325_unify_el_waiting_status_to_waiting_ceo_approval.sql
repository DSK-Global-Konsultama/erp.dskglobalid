-- 20260325_unify_el_waiting_status_to_waiting_ceo_approval.sql
-- Unify Engagement Letter waiting status to WAITING_CEO_APPROVAL for consistency.

START TRANSACTION;

-- 1) Convert data
UPDATE lead_engagement_letters
SET status = 'WAITING_CEO_APPROVAL'
WHERE status = 'WAITING_APPROVAL';

-- 2) Update enum (MySQL)
ALTER TABLE lead_engagement_letters
  MODIFY status ENUM('DRAFT','WAITING_CEO_APPROVAL','REVISION','APPROVED','SENT','SIGNED')
  NOT NULL DEFAULT 'DRAFT';

COMMIT;
