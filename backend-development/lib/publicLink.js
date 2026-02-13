// backend-development/lib/publicLink.js

const DEFAULT_PUBLIC_ORIGIN = process.env.PUBLIC_FORM_ORIGIN || 'http://localhost:5173';

function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '') || 'form';
}

function buildPublicFormUrl({ publicSlug } = {}) {
  const origin = String(DEFAULT_PUBLIC_ORIGIN).replace(/\/+$/, '');
  const slug = slugify(publicSlug || 'form');
  return `${origin}/${slug}`;
}

function buildPublicQrUrl(publicUrl) {
  const url = String(publicUrl || '').trim();
  if (!url) return null;
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`;
}

module.exports = { slugify, buildPublicFormUrl, buildPublicQrUrl };
