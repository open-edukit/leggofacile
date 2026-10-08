#!/usr/bin/env node
/**
 * scripts/bump-version.js
 * Pipeline per il controllo e l'avanzamento sincronizzato di versione in LeggoFacile:
 * - package.json
 * - index.html (badge header UI)
 * - README.md (badge Shields.io)
 * - docs/changelog.md (controllo presenza sezione)
 *
 * Utilizzo:
 *   node scripts/bump-version.js --check
 *   node scripts/bump-version.js <new-version> [--tag]
 *   Esempi:
 *     node scripts/bump-version.js 2.1.3
 *     node scripts/bump-version.js 2.2.0 --tag
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const files = {
  packageJson: path.join(rootDir, 'package.json'),
  indexHtml: path.join(rootDir, 'index.html'),
  readmeMd: path.join(rootDir, 'README.md'),
  changelogMd: path.join(rootDir, 'docs', 'changelog.md')
};

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

const args = process.argv.slice(2);
const isCheck = args.includes('--check');
const shouldCreateTag = args.includes('--tag');
const targetVersionArg = args.find(a => !a.startsWith('--'));

// 1. Leggi versione da package.json
const pkgRaw = read(files.packageJson);
const pkg = JSON.parse(pkgRaw);
const currentPkgVersion = pkg.version;

// 2. Estrai versione da index.html
const indexHtml = read(files.indexHtml);
const indexMatch = indexHtml.match(/<span class="[^"]*rounded-full[^"]*">\s*v([0-9]+\.[0-9]+\.[0-9]+)\s*<\/span>/);
const currentIndexVersion = indexMatch ? indexMatch[1] : null;

// 3. Estrai versione da README.md
const readmeMd = read(files.readmeMd);
const readmeMatch = readmeMd.match(/img\.shields\.io\/badge\/version-([0-9]+\.[0-9]+\.[0-9]+)-/);
const currentReadmeVersion = readmeMatch ? readmeMatch[1] : null;

if (isCheck) {
  console.log('🔍 Controllo coerenza versioni LeggoFacile:');
  console.log(`   package.json: ${currentPkgVersion}`);
  console.log(`   index.html:   ${currentIndexVersion || 'NON TROVATO'}`);
  console.log(`   README.md:    ${currentReadmeVersion || 'NON TROVATO'}`);

  const aligned = currentPkgVersion === currentIndexVersion && currentPkgVersion === currentReadmeVersion;
  if (!aligned) {
    console.error('❌ ERRORE: Le versioni non sono allineate tra i file!');
    process.exit(1);
  }

  // Verifica presenza nel changelog
  const changelog = read(files.changelogMd);
  const changelogHasVersion = changelog.includes(`## [${currentPkgVersion}]`);
  if (!changelogHasVersion) {
    console.warn(`⚠️ ATTENZIONE: La versione ${currentPkgVersion} non è ancora presente in docs/changelog.md!`);
  } else {
    console.log(`   changelog.md: Sezione [${currentPkgVersion}] presente.`);
  }

  console.log('✅ Tutte le versioni risultano sincronizzate.');
  process.exit(0);
}

if (!targetVersionArg) {
  console.error('❌ Specificare la nuova versione o il comando --check.');
  console.error('   Es: node scripts/bump-version.js 2.1.3 [--tag]');
  process.exit(1);
}

const newVersion = targetVersionArg.replace(/^v/, '');
if (!/^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$/.test(newVersion)) {
  console.error(`❌ Formato versione non valido: "${newVersion}". Utilizzare il formato SemVer X.Y.Z`);
  process.exit(1);
}

console.log(`🚀 Avanzamento versione a v${newVersion}...`);

// Aggiorna package.json
pkg.version = newVersion;
write(files.packageJson, JSON.stringify(pkg, null, 2) + '\n');
console.log('✔ package.json aggiornato.');

// Aggiorna index.html
if (indexMatch) {
  const updatedIndexHtml = indexHtml.replace(
    indexMatch[0],
    indexMatch[0].replace(`v${currentIndexVersion}`, `v${newVersion}`)
  );
  write(files.indexHtml, updatedIndexHtml);
  console.log('✔ index.html aggiornato.');
} else {
  console.warn('⚠️ Impossibile trovare il badge versione in index.html');
}

// Aggiorna README.md
if (readmeMatch) {
  const updatedReadme = readmeMd.replace(
    /badge\/version-[0-9]+\.[0-9]+\.[0-9]+-/,
    `badge/version-${newVersion}-`
  );
  write(files.readmeMd, updatedReadme);
  console.log('✔ README.md aggiornato.');
} else {
  console.warn('⚠️ Impossibile trovare il badge versione in README.md');
}

// Verifica changelog
const changelog = read(files.changelogMd);
if (!changelog.includes(`## [${newVersion}]`)) {
  console.warn(`⚠️ Ricordati di aggiungere la sezione "## [${newVersion}]" in docs/changelog.md!`);
}

if (shouldCreateTag) {
  try {
    console.log(`🏷️ Creazione tag git v${newVersion}...`);
    execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { stdio: 'inherit', cwd: rootDir });
    console.log(`✅ Tag v${newVersion} creato con successo.`);
  } catch (err) {
    console.error('❌ Errore durante la creazione del tag git:', err.message);
  }
}
