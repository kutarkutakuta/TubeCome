// Lightweight IndexedDB helper for favorites
const DB_NAME = 'tubecome_db';
const STORE = 'favorites';
const VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllFavorites(): Promise<Array<{id:string,title?:string,createdAt:number}>> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      // sort by createdAt desc
      const arr = (req.result || []).sort((a:any,b:any)=>b.createdAt - a.createdAt);
      resolve(arr);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function addFavorite(id: string, title?: string) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const payload = { id, title, createdAt: Date.now() };
    const req = store.put(payload);
    req.onsuccess = () => {
      window.dispatchEvent(new CustomEvent('favorites-changed'));
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function removeFavorite(id: string) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const req = store.delete(id);
    req.onsuccess = () => {
      window.dispatchEvent(new CustomEvent('favorites-changed'));
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function isFavorite(id: string): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.get(id);
    req.onsuccess = () => resolve(!!req.result);
    req.onerror = () => reject(req.error);
  });
}
