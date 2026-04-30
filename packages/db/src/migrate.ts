import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error('❌ DATABASE_URL is not set. Create packages/db/.env or export it.');
  process.exit(1);
}

function isAlreadyExists(err: any): boolean {
  const msg = String(err?.message || '');
  return (
    msg.includes('already exists') ||
    msg.includes('duplicate') ||
    err?.code === '42P07' ||
    err?.code === '42710' ||
    err?.code === '42P06' ||
    err?.code === '42723'
  );
}

function splitStatements(sqlText: string): string[] {
  const stripped = sqlText
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  return stripped
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function migrate() {
  const migrationsDir = path.resolve(__dirname, '../drizzle/migrations');
  const arg = process.argv[2];
  const files = arg
    ? [path.resolve(migrationsDir, arg)]
    : fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort()
        .map((f) => path.resolve(migrationsDir, f));

  for (const sqlPath of files) {
    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ Migration file not found at: ${sqlPath}`);
      process.exit(1);
    }
    await runMigrationFile(sqlPath);
  }
}

async function runMigrationFile(sqlPath: string) {

  const sql = neon(DB_URL!);
  console.log('🔌 Migrating against Neon (HTTP driver, per-statement)');
  console.log(`📄 Source: ${path.basename(sqlPath)}\n`);

  const statements = splitStatements(fs.readFileSync(sqlPath, 'utf-8'));
  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const stmt of statements) {
    const firstLine = stmt.split('\n').find((l) => l.trim().length > 0)?.trim() ?? '';
    const label = firstLine.slice(0, 70);
    try {
      await (sql as any)(stmt);
      console.log(`   ✅ ${label}`);
      ok++;
    } catch (err: any) {
      if (isAlreadyExists(err)) {
        console.log(`   ⏭️  ${label} (already exists)`);
        skipped++;
      } else {
        console.error(`   ❌ ${label} — ${err.message}`);
        failed++;
      }
    }
  }

  console.log(`\n📊 Summary: ${ok} ok, ${skipped} skipped, ${failed} failed (of ${statements.length})`);
  if (failed > 0) {
    console.error('❌ Migration finished with failures.');
    process.exit(1);
  }
  console.log(`🎉 ${path.basename(sqlPath)} complete!\n`);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
