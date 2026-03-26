import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const AAB_PATH   = path.join(__dirname, '../android/app/build/outputs/bundle/release/app-release.aab');
const KEY_PATH   = path.join(__dirname, '../secrets/service-account.json');
const PACKAGE    = 'io.argmetrics.app';
const TRACK      = 'internal';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const client = await auth.getClient();
  const publisher = google.androidpublisher({ version: 'v3', auth: client });

  console.log('📦 Creando edit...');
  const editRes = await publisher.edits.insert({ packageName: PACKAGE });
  const editId = editRes.data.id;
  console.log('   Edit ID:', editId);

  console.log('⬆️  Subiendo AAB...');
  const aabRes = await publisher.edits.bundles.upload({
    packageName: PACKAGE,
    editId,
    media: {
      mimeType: 'application/octet-stream',
      body: fs.createReadStream(AAB_PATH),
    },
  });
  console.log('   Version code:', aabRes.data.versionCode);

  console.log('🔀 Asignando a track:', TRACK);
  await publisher.edits.tracks.update({
    packageName: PACKAGE,
    editId,
    track: TRACK,
    requestBody: {
      track: TRACK,
      releases: [{
        versionCodes: [String(aabRes.data.versionCode)],
        status: 'draft',
      }],
    },
  });

  console.log('✅ Commiteando edit...');
  const commitRes = await publisher.edits.commit({
    packageName: PACKAGE,
    editId,
  });
  console.log('   Estado:', commitRes.status, commitRes.statusText);
  console.log('\n🎉 App subida exitosamente al track "internal"!');
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  if (err.errors) err.errors.forEach(e => console.error('  -', e.message));
  process.exit(1);
});
