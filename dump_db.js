import Database from 'better-sqlite3';
import fs from 'fs';

try {
  const db = new Database('tmp/db.sqlite3', { fileMustExist: true });
  
  // Get all user tables
  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`).all();

  let sql = '-- RPS Royale SQLite Database Dump\n\n';

  for (const table of tables) {
    const tableName = table.name;
    
    // Get CREATE TABLE statement
    const schemaRow = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(tableName);
    if (schemaRow && schemaRow.sql) {
      sql += schemaRow.sql + ';\n';
    }

    // Get rows
    const rows = db.prepare(`SELECT * FROM "${tableName}"`).all();
    for (const row of rows) {
      const columns = Object.keys(row).map(c => `"${c}"`).join(', ');
      const values = Object.values(row).map(v => {
        if (v === null) return 'NULL';
        if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
        return v;
      }).join(', ');
      sql += `INSERT INTO "${tableName}" (${columns}) VALUES (${values});\n`;
    }
    sql += '\n';
  }

  fs.writeFileSync('database_dump.sql', sql);
  console.log('Database dump successfully saved to database_dump.sql');
} catch (e) {
  console.error('Failed to create dump:', e.message);
}
