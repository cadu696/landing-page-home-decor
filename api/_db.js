const fs = require('fs');
const path = require('path');

function readDb() {
  const dbPath = path.join(process.cwd(), 'backend', 'db.json');
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

module.exports = { readDb };
