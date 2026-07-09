#!/usr/bin/env node
import { execSync } from 'child_process';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
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

  const tmpFile = `/tmp/skill_${name}.md`;
  writeFileSync(tmpFile, content);

  try {
    execSync(
      `npx wrangler kv key put --remote --binding=SKILL_KV "${name}" --path="${tmpFile}"`,
      { stdio: 'inherit', cwd: join(__dirname, '..') }
    );
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

console.log('Done. Verify with: npx wrangler kv key list --binding=SKILL_KV');
