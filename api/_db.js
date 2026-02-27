const fs = require('fs');
const path = require('path');

const os = require('os');
const TMP_DB = path.join(os.tmpdir(), 'hometop-db.json');
const ORIGINAL_DB = path.join(process.cwd(), 'backend', 'db.json');

function readDb() {
  // Try /tmp first (modified data), fallback to original
  try {
    if (fs.existsSync(TMP_DB)) {
      return JSON.parse(fs.readFileSync(TMP_DB, 'utf8'));
    }
  } catch {}
  return JSON.parse(fs.readFileSync(ORIGINAL_DB, 'utf8'));
}

function writeDb(data) {
  fs.writeFileSync(TMP_DB, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readDb, writeDb };
