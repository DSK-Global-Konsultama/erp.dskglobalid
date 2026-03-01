const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/apply_migration.js <migration.sql>');
    process.exit(1);
  }

  const migrationPath = path.isAbsolute(file)
    ? file
    : path.join(__dirname, '..', 'migrations', file);

  const sql = fs.readFileSync(migrationPath, 'utf8');

  // mysql2 doesn't run multiple statements unless enabled.
  // Split by semicolon at end-of-statement boundaries.
  const withoutComments = sql
    .split(/\r?\n/)
    .map((line) => (line.trim().startsWith('--') ? '' : line))
    .join('\n');

  const statements = withoutComments
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `${s};`);

  for (const stmt of statements) {
    // Skip comment-only chunks
    const cleaned = stmt.trim();
    if (!cleaned || cleaned === ';') continue;
    await pool.query(cleaned);
  }

  console.log(`Applied migration: ${migrationPath}`);
  process.exit(0);
}

main().catch((e) => {
  console.error('Migration failed:', e.message);
  process.exit(1);
});
