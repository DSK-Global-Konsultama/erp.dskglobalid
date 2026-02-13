-- Optional: store a QR code URL (or data) for the public form link.
-- The FE currently generates QR previews; this column enables BE-side generation/caching.

ALTER TABLE forms
  ADD COLUMN public_qr_url TEXT NULL AFTER public_slug;
