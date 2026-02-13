-- Add a dedicated public slug/path field for forms.
-- This replaces the overloaded `public_link` usage for public routing.
--
-- Notes:
-- - `public_slug` stores a path-friendly slug string (e.g. "my-campaign-form").
-- - Must be unique across all forms to avoid collisions.
-- - We keep `public_link` for backward compatibility.

ALTER TABLE forms
  ADD COLUMN public_slug VARCHAR(191) NULL AFTER public_link;

-- A unique index allows NULL values (multiple NULLs are allowed in MySQL).
CREATE UNIQUE INDEX forms_public_slug_uq ON forms (public_slug);
