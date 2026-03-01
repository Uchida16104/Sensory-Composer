async function initSqlJs() {
  if (typeof window === "undefined") {
    throw new Error("sql.js export helper must run in a browser environment.");
  }

  const SQL = await window.initSqlJs({
    locateFile: (file) =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/${file}`,
  });

  return SQL;
}

async function exportScoresToSQLite(scores) {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS scores (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      poem TEXT,
      audio_base64 TEXT,
      visual_data_url TEXT,
      created_at TEXT
    )
  `);

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO scores
    (id, title, poem, audio_base64, visual_data_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const score of scores) {
    stmt.run([
      score.id,
      score.title,
      score.poem ?? null,
      score.audioBase64 ?? null,
      score.visualDataUrl ?? null,
      score.createdAt ?? new Date().toISOString(),
    ]);
  }

  stmt.free();

  const uint8Array = db.export();
  db.close();

  return uint8Array;
}

function downloadSQLiteFile(uint8Array, filename = "scores.sqlite") {
  const blob = new Blob([uint8Array], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function importScoresFromSQLite(file) {
  const SQL = await initSqlJs();
  const buffer = await file.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(buffer));

  const result = db.exec("SELECT * FROM scores");
  db.close();

  if (!result.length) return [];

  const { columns, values } = result[0];
  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return {
      id: obj.id,
      title: obj.title,
      poem: obj.poem,
      audioBase64: obj.audio_base64,
      visualDataUrl: obj.visual_data_url,
      createdAt: obj.created_at,
    };
  });
}

if (typeof module !== "undefined") {
  module.exports = {
    exportScoresToSQLite,
    downloadSQLiteFile,
    importScoresFromSQLite,
  };
}
