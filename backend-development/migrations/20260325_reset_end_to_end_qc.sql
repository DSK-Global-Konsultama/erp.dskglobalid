-- 20260325_reset_end_to_end_qc.sql
-- PURPOSE: Reset transactional data for end-to-end QC (Campaign -> Form -> Bank Data -> Lead -> Tracker Docs)
-- SAFETY: Does NOT touch users/roles/departments.
-- TARGET: MySQL
-- NOTE: This will DELETE data permanently.

START TRANSACTION;

SET FOREIGN_KEY_CHECKS = 0;

-- 1) Lead tracker docs (children of leads)
-- NOTE: MySQL can throw #1701 on TRUNCATE even with FOREIGN_KEY_CHECKS=0.
-- Use DELETE for FK-related tables; optionally reset AUTO_INCREMENT afterward.
DELETE FROM lead_handovers;
DELETE FROM lead_engagement_letters;
DELETE FROM lead_proposals;
DELETE FROM lead_notulensi;
DELETE FROM lead_meetings;

-- 2) Core lead pipeline
DELETE FROM leads;

-- 3) Bank data & form submissions
DELETE FROM bank_data_entries;

-- 4) Campaign/Form builder (end-to-end reset)
DELETE FROM campaign_forms;
DELETE FROM form_channel_links;
DELETE FROM form_field_options;
DELETE FROM form_fields;
DELETE FROM forms;
DELETE FROM campaigns;

-- 5) Optional: audit logs (usually derived, safe to clear for QA)
DELETE FROM audit_logs;

-- Optional: reset auto-increment counters (uncomment if you want IDs restart from 1)
-- ALTER TABLE lead_handovers AUTO_INCREMENT = 1;
-- ALTER TABLE lead_engagement_letters AUTO_INCREMENT = 1;
-- ALTER TABLE lead_proposals AUTO_INCREMENT = 1;
-- ALTER TABLE lead_notulensi AUTO_INCREMENT = 1;
-- ALTER TABLE lead_meetings AUTO_INCREMENT = 1;
-- ALTER TABLE leads AUTO_INCREMENT = 1;
-- ALTER TABLE bank_data_entries AUTO_INCREMENT = 1;
-- ALTER TABLE forms AUTO_INCREMENT = 1;
-- ALTER TABLE form_fields AUTO_INCREMENT = 1;
-- ALTER TABLE form_field_options AUTO_INCREMENT = 1;
-- ALTER TABLE form_channel_links AUTO_INCREMENT = 1;
-- ALTER TABLE campaigns AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

COMMIT;
