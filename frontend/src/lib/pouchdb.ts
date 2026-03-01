import { ScorePackage } from "./indexeddb";

const COUCH_URL =
  process.env.NEXT_PUBLIC_COUCH_URL ?? "http://localhost:5984";
const DB_NAME = "sensory-composer-scores";

interface PouchDocument extends ScorePackage {
  _id: string;
  _rev?: string;
}

async function getCouchURL(): Promise<string> {
  return `${COUCH_URL}/${DB_NAME}`;
}

async function ensureDatabase(): Promise<void> {
  const url = await getCouchURL();
  const res = await fetch(url, { method: "HEAD" });
  if (res.status === 404) {
    await fetch(url, { method: "PUT" });
  }
}

export async function syncToCouchDB(pkg: ScorePackage): Promise<void> {
  try {
    await ensureDatabase();
    const url = `${await getCouchURL()}/${pkg.id}`;

    const checkRes = await fetch(url);
    let rev: string | undefined;
    if (checkRes.ok) {
      const existing = (await checkRes.json()) as PouchDocument;
      rev = existing._rev;
    }

    const doc: PouchDocument = {
      ...pkg,
      _id: pkg.id,
      ...(rev ? { _rev: rev } : {}),
    };

    const putRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    });

    if (!putRes.ok) {
      const errBody = await putRes.text();
      throw new Error(`CouchDB sync failed: ${putRes.status} ${errBody}`);
    }
  } catch (err) {
    console.warn("CouchDB sync error (offline?):", err);
    throw err;
  }
}

export async function fetchFromCouchDB(id: string): Promise<ScorePackage | null> {
  try {
    const url = `${await getCouchURL()}/${id}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const doc = (await res.json()) as PouchDocument;
    const { _id, _rev, ...pkg } = doc;
    void _id;
    void _rev;
    return pkg as ScorePackage;
  } catch {
    return null;
  }
}

export async function fetchAllFromCouchDB(): Promise<ScorePackage[]> {
  try {
    const url = `${await getCouchURL()}/_all_docs?include_docs=true`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json() as {
      rows: Array<{ doc: PouchDocument }>;
    };
    return data.rows
      .map((r) => {
        const { _id, _rev, ...pkg } = r.doc;
        void _id;
        void _rev;
        return pkg as ScorePackage;
      })
      .filter((p) => !p.id.startsWith("_design"));
  } catch {
    return [];
  }
}
