/* =====================================================
   Storage Module - LocalStorage & IndexedDB Management
   ===================================================== */

const Storage = {
    DB_NAME: 'CUT-AI-DB',
    DB_VERSION: 1,
    STORE_NAME: 'analyses',
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    },

    async saveAnalysis(data) {
        try {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.STORE_NAME], 'readwrite');
                const store = transaction.objectStore(this.STORE_NAME);
                
                const analysisData = {
                    objectName: data.objectName,
                    cutType: data.cutType,
                    svgData: data.svgData,
                    pngDataUrl: data.pngDataUrl,
                    components: data.components,
                    analysis: data.analysis,
                    timestamp: Date.now(),
                    settings: data.settings
                };
                
                const request = store.add(analysisData);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error saving analysis:', error);
        }
    },

    async getAnalyses(limit = 10) {
        try {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.STORE_NAME], 'readonly');
                const store = transaction.objectStore(this.STORE_NAME);
                const index = store.index('timestamp');
                const range = IDBKeyRange.lowerBound(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
                
                const request = index.getAll(range);
                request.onsuccess = () => {
                    const results = request.result.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
                    resolve(results);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error retrieving analyses:', error);
            return [];
        }
    },

    async deleteAnalysis(id) {
        try {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.STORE_NAME], 'readwrite');
                const store = transaction.objectStore(this.STORE_NAME);
                const request = store.delete(id);
                
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error deleting analysis:', error);
        }
    },

    setLocalStorage(key, value) {
        try {
            localStorage.setItem('cut-ai-' + key, JSON.stringify(value));
        } catch (error) {
            console.error('LocalStorage error:', error);
        }
    },

    getLocalStorage(key) {
        try {
            const item = localStorage.getItem('cut-ai-' + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('LocalStorage error:', error);
            return null;
        }
    },

    clearLocalStorage() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('cut-ai-')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('LocalStorage error:', error);
        }
    }
};

// Initialize storage on load
if ('indexedDB' in window) {
    Storage.init().catch(e => console.warn('IndexedDB not available:', e));
}
