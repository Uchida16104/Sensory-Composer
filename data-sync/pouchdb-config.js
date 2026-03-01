const COUCH_URL = process.env.COUCH_URL || "http://localhost:5984";
const DB_NAME = "sensory-composer-scores";

const remoteURL = `${COUCH_URL}/${DB_NAME}`;

async function ensureRemoteDatabase() {
  const res = await fetch(remoteURL, { method: "HEAD" });
  if (res.status === 404) {
    const put = await fetch(remoteURL, { method: "PUT" });
    if (!put.ok && put.status !== 412) {
      throw new Error(`Failed to create CouchDB database: ${put.status}`);
    }
  }
}

async function putDocument(doc) {
  if (!doc._id) throw new Error("Document must have an _id field.");
  const url = `${remoteURL}/${encodeURIComponent(doc._id)}`;

  const check = await fetch(url);
  let rev;
  if (check.ok) {
    const existing = await check.json();
    rev = existing._rev;
  }

  const body = rev ? { ...doc, _rev: rev } : doc;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CouchDB PUT failed: ${res.status} ${text}`);
  }

  return res.json();
}

async function getDocument(id) {
  const res = await fetch(`${remoteURL}/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  return res.json();
}

async function getAllDocuments() {
  const res = await fetch(`${remoteURL}/_all_docs?include_docs=true`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.rows
    .map((r) => r.doc)
    .filter((d) => d && !d._id.startsWith("_design"));
}

async function deleteDocument(id, rev) {
  const res = await fetch(
    `${remoteURL}/${encodeURIComponent(id)}?rev=${encodeURIComponent(rev)}`,
    { method: "DELETE" }
  );
  return res.ok;
}

module.exports = {
  ensureRemoteDatabase,
  putDocument,
  getDocument,
  getAllDocuments,
  deleteDocument,
  remoteURL,
};
