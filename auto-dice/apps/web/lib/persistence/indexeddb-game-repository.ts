import { deserializeGame, serializeGame, type Game } from "@whad/domain";
import type { GameRepository } from "@whad/domain";

const DB_NAME = "whad-auto-dice";
const STORE = "games";
const VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export class IndexedDbGameRepository implements GameRepository {
  async saveGame(game: Game): Promise<void> {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(serializeGame(game), game.id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async loadGame(id: string): Promise<Game | null> {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => {
        const v = req.result;
        if (typeof v !== "string") resolve(null);
        else {
          try {
            resolve(deserializeGame(v));
          } catch {
            resolve(null);
          }
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  async listGameIds(): Promise<string[]> {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAllKeys();
      req.onsuccess = () => resolve((req.result as IDBValidKey[]).map(String));
      req.onerror = () => reject(req.error);
    });
  }
}
