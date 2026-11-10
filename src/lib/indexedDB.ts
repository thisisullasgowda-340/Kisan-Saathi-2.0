import { ScanResult, Crop, Disease, AgriculturalShop, ExpertConsultation } from '../types';
import { SEED_CROPS, SEED_DISEASES, SEED_SHOPS } from '../data/seedData';

const DB_NAME = 'KisanSaathi_DB';
const DB_VERSION = 1;

class OfflineStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = request.result;

        if (!db.objectStoreNames.contains('scans')) {
          const scanStore = db.createObjectStore('scans', { keyPath: 'id' });
          scanStore.createIndex('timestamp', 'timestamp', { unique: false });
          scanStore.createIndex('cropId', 'cropId', { unique: false });
        }

        if (!db.objectStoreNames.contains('crops')) {
          db.createObjectStore('crops', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('diseases')) {
          const diseaseStore = db.createObjectStore('diseases', { keyPath: 'id' });
          diseaseStore.createIndex('cropId', 'cropId', { unique: false });
        }

        if (!db.objectStoreNames.contains('shops')) {
          const shopStore = db.createObjectStore('shops', { keyPath: 'id' });
          shopStore.createIndex('district', 'district', { unique: false });
        }

        if (!db.objectStoreNames.contains('consultations')) {
          db.createObjectStore('consultations', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('[IndexedDB] Failed to open database:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Initialize seed caches if empty
  async initializeDefaults(): Promise<void> {
    try {
      const db = await this.openDB();
      const cropsCount = await this.countRecords('crops');
      if (cropsCount === 0) {
        for (const crop of SEED_CROPS) {
          await this.put('crops', crop);
        }
      }

      const diseaseCount = await this.countRecords('diseases');
      if (diseaseCount === 0) {
        for (const disease of SEED_DISEASES) {
          await this.put('diseases', disease);
        }
      }

      const shopCount = await this.countRecords('shops');
      if (shopCount === 0) {
        for (const shop of SEED_SHOPS) {
          await this.put('shops', shop);
        }
      }
    } catch (err) {
      console.warn('[IndexedDB] Pre-cache initialization error:', err);
    }
  }

  private countRecords(storeName: string): Promise<number> {
    return new Promise(async (resolve) => {
      try {
        const db = await this.openDB();
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(0);
      } catch {
        resolve(0);
      }
    });
  }

  async put<T>(storeName: string, item: T): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Specialized Scan History
  async saveScan(scan: ScanResult): Promise<void> {
    await this.put('scans', scan);
  }

  async getScans(): Promise<ScanResult[]> {
    const scans = await this.getAll<ScanResult>('scans');
    return scans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async deleteScan(id: string): Promise<void> {
    await this.delete('scans', id);
  }

  async clearScans(): Promise<void> {
    await this.clear('scans');
  }

  // Specialized Consultations
  async saveConsultation(consultation: ExpertConsultation): Promise<void> {
    await this.put('consultations', consultation);
  }

  async getConsultations(): Promise<ExpertConsultation[]> {
    const list = await this.getAll<ExpertConsultation>('consultations');
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Specialized Shops
  async getShops(): Promise<AgriculturalShop[]> {
    const shops = await this.getAll<AgriculturalShop>('shops');
    return shops.length > 0 ? shops : SEED_SHOPS;
  }

  async saveShop(shop: AgriculturalShop): Promise<void> {
    await this.put('shops', shop);
  }

  async deleteShop(id: string): Promise<void> {
    await this.delete('shops', id);
  }

  // Specialized Crops & Diseases
  async getCrops(): Promise<Crop[]> {
    const list = await this.getAll<Crop>('crops');
    return list.length > 0 ? list : SEED_CROPS;
  }

  async saveCrop(crop: Crop): Promise<void> {
    await this.put('crops', crop);
  }

  async getDiseases(): Promise<Disease[]> {
    const list = await this.getAll<Disease>('diseases');
    return list.length > 0 ? list : SEED_DISEASES;
  }

  async saveDisease(disease: Disease): Promise<void> {
    await this.put('diseases', disease);
  }

  async deleteDisease(id: string): Promise<void> {
    await this.delete('diseases', id);
  }
}

export const offlineDB = new OfflineStorage();
// Initialize storage
offlineDB.initializeDefaults();
