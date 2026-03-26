/**
 * release.mjs — build + upload automático a Google Play
 * Uso: node scripts/release.mjs [internal|alpha|beta|production]
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.join(__dirname, '..');
const BUILD_GRADLE = path.join(ROOT, 'android/app/build.gradle');
const AAB_PATH   = path.join(ROOT, 'android/app/build/outputs/bundle/release/app-release.aab');
const KEY_PATH   = path.join(ROOT, 'secrets/service-account.json');
const PACKAGE    = 'io.argmetrics.app';
const TRACK      = process.argv[2] || 'internal';

// ── 1. Leer y auto-incrementar versionCode ───────────────────────────────────
function bumpVersionCode() {
  let gradle = fs.readFileSync(BUILD_GRADLE, 'utf8');
  const match = gradle.match(/versionCode\s+(\d+)/);
  if (!match) throw new Error('No se encontró versionCode en build.gradle');
  const current = parseInt(match[1]);
  const next = current + 1;
  gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${next}`);
  fs.writeFileSync(BUILD_GRADLE, gradle);
  console.log(`📝 versionCode: ${current} → ${next}`);
  return next;
}

// ── 2. Compilar AAB ──────────────────────────────────────────────────────────
function buildAAB() {
  console.log('🔨 Compilando AAB...');
  const nodeBin = path.dirname(process.execPath);
  const androidHome = process.env.ANDROID_HOME || `${process.env.HOME}/Android/sdk`;
  const newPath = `${nodeBin}:${process.env.PATH}`;
  const gradleEnv = `export PATH="${newPath}" ANDROID_HOME="${androidHome}"`;
  execSync(`${gradleEnv} && ./gradlew --stop`, { cwd: path.join(ROOT, 'android'), stdio: 'inherit', shell: '/bin/bash' });
  execSync(`${gradleEnv} && ./gradlew bundleRelease`, { cwd: path.join(ROOT, 'android'), stdio: 'inherit', shell: '/bin/bash' });
  console.log('✅ Build exitoso');
}

// ── 3. Subir a Google Play ───────────────────────────────────────────────────
async function uploadToPlay(versionCode) {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });
  const publisher = google.androidpublisher({ version: 'v3', auth: await auth.getClient() });

  console.log('\n📦 Creando edit en Play Console...');
  const { data: { id: editId } } = await publisher.edits.insert({ packageName: PACKAGE });

  console.log('⬆️  Subiendo AAB...');
  const { data: bundle } = await publisher.edits.bundles.upload({
    packageName: PACKAGE,
    editId,
    media: { mimeType: 'application/octet-stream', body: fs.createReadStream(AAB_PATH) },
  });
  console.log(`   Version code subido: ${bundle.versionCode}`);

  console.log(`🔀 Asignando al track: ${TRACK}`);
  await publisher.edits.tracks.update({
    packageName: PACKAGE,
    editId,
    track: TRACK,
    requestBody: {
      track: TRACK,
      releases: [{ versionCodes: [String(bundle.versionCode)], status: 'draft' }],
    },
  });

  console.log('💾 Commiteando...');
  await publisher.edits.commit({ packageName: PACKAGE, editId });
  console.log(`\n🎉 v${versionCode} subida al track "${TRACK}" exitosamente!`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n=== ARGmetrics Release → track: ${TRACK} ===\n`);
  const versionCode = bumpVersionCode();
  buildAAB();
  await uploadToPlay(versionCode);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  if (err.errors) err.errors.forEach(e => console.error('  -', e.message));
  process.exit(1);
});
