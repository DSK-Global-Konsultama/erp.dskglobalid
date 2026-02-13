-- Add per-field note/subtitle to form_fields
-- MySQL

ALTER TABLE `form_fields`
  ADD COLUMN `note` TEXT NULL AFTER `label`;
