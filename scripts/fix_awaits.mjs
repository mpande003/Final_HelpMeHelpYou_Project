import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardDir = path.join(__dirname, '../app/dashboard');
const files = fs.readdirSync(dashboardDir)
  .filter(f => f.endsWith('-actions.ts') || f === 'actions.ts');

for (const file of files) {
  const filePath = path.join(dashboardDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix .find() on list functions
  const listRegex = /(list[A-Za-z]+)\(\)\.find/g;
  content = content.replace(listRegex, '(await $1()).find');

  // Fix missing awaits on creator/updater actions
  const mutatorRegex = /^(?!\s*await\s)(?!\s*\/\/)([\s]*)(create[A-Za-z]+|update[A-Za-z]+|delete[A-Za-z]+|approve[A-Za-z]+|assign[A-Za-z]+|verify[A-Za-z]+|fulfill[A-Za-z]+)\(/gm;
  // Make sure not to double add await
  content = content.replace(mutatorRegex, '$1await $2(');

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log("Fixed DB awaits inside actions");
