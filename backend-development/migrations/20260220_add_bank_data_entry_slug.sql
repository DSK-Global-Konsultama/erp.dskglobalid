-- Add entry_slug for tracking which public slug (e.g. -instagram / -linkedin) the user used to submit.

ALTER TABLE bank_data_entries
  ADD COLUMN entry_slug VARCHAR(255) NULL AFTER source_channel;
