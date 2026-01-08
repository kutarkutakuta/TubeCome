// Lightweight IndexedDB helper for registered channels
const DB_NAME = 'tubecome_db';
const STORE = 'channels';
// Bump version to ensure migrations run when the store name changed previously
const VERSION = 2;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = (event) => {
      const db = req.result;
      const upgradeTx = (event.target as IDBOpenDBRequest).transaction;

      // Ensure channels store exists
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }

      // If an older 'favorites' store exists, migrate its data into 'channels'
      if (db.objectStoreNames.contains('favorites') && upgradeTx) {
        try {
          const oldStore = upgradeTx.objectStore('favorites');
          const newStore = upgradeTx.objectStore(STORE);
          const getReq = oldStore.getAll();
          getReq.onsuccess = () => {
            const items = getReq.result || [];
            for (const it of items) {
              try { newStore.put({ id: it.id, title: it.title, createdAt: it.createdAt }); } catch (e) { /* ignore */ }
            }
          };
          // Note: We intentionally do not delete the old store to avoid destructive migrations
        } catch (e) {
          // ignore migration errors
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllChannels(): Promise<Array<{id:string,title?:string,createdAt:number,order?:number,thumbnail?:string}>> {
  const db = await openDB();
  // If the store does not exist for any reason, return empty list instead of throwing
  if (!db.objectStoreNames.contains(STORE)) return [];
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      const res:any[] = req.result || [];
      // If 'order' exists on items, sort ascending by order. Otherwise fallback to createdAt desc
      const arr = res.sort((a:any,b:any) => {
        const aHas = typeof a.order === 'number';
        const bHas = typeof b.order === 'number';
        if (aHas && bHas) return a.order - b.order;
        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;
        return b.createdAt - a.createdAt;
      });
      resolve(arr);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function addChannel(id: string, title?: string) {
  const db = await openDB();
  // Determine next order value (append to end)
  const existing = await getAllChannels();
  const maxOrder = existing.reduce((acc, cur) => (typeof cur.order === 'number' ? Math.max(acc, cur.order) : acc), -1);
  const order = maxOrder + 1;

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const payload = { id, title, createdAt: Date.now(), order } as any;
    const req = store.put(payload);
    req.onsuccess = () => {
      window.dispatchEvent(new CustomEvent('channels-changed'));
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function removeChannel(id: string) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const req = store.delete(id);
    req.onsuccess = () => {
      window.dispatchEvent(new CustomEvent('channels-changed'));
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function setChannelsOrder(ids: string[]) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    try {
      ids.forEach((id, idx) => {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const rec = getReq.result || { id };
          rec.order = idx;
          store.put(rec);
        };
      });
    } catch (e) {
      // ignore per-item errors
    }
    tx.oncomplete = () => {
      window.dispatchEvent(new CustomEvent('channels-changed'));
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function isChannelRegistered(id: string): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.get(id);
    req.onsuccess = () => resolve(!!req.result);
    req.onerror = () => reject(req.error);
  });
}

// Backwards-compatible aliases for existing imports
export const getAllFavorites = getAllChannels;
export const addFavorite = addChannel;
export const removeFavorite = removeChannel;
export const isFavorite = isChannelRegistered;
