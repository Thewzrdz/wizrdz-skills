#!/usr/bin/env node
/**
 * Upload all SKILL.md files to the Cloudflare KV namespace.
 *
 * Usage:
 *   1. Deploy the Worker once so the KV namespace exists:
 *        wrangler kv namespace create SKILL_KV
 *   2. Fill the KV namespace id into wrangler.toml
 *   3. Run:
 *        node scripts/upload-skills.js
 *        # or: npm run upload-skills
 *
 * Each skill is stored with its directory name as the key.
 */

import { execSync } from 'child_process';
import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillsDir = join(__dirname, '..', '..', 'skills');

const skills = readdirSync(skillsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

if (skills.length === 0) {
  console.error('No skills found in', skillsDir);
  process.exit(1);
}

console.log(`Uploading ${skills.length} skills to SKILL_KV...`);

for (const name of skills) {
  const skillFile = join(skillsDir, name, 'SKILL.md');
  let content;
  try {
    content = readFileSync(skillFile, 'utf8');
  } catch {
    console.warn(`  SKIP ${name} — no SKILL.md found`);
    continue;
  }

  // Write to a temp file so wrangler can read it without shell escaping issues
  const tmpFile = `/tmp/skill_${name}.md`;
  import('fs').then(({ writeFileSync }) => writeFileSync(tmpFile, content));

  try {
    execSync(
      `wrangler kv key put --binding=SKILL_KV "${name}" --path="${tmpFile}"`,
      { stdio: 'inherit', cwd: join(__dirname, '..') }
    );
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

console.log('Done. Verify with: wrangler kv key list --binding=SKILL_KV');
