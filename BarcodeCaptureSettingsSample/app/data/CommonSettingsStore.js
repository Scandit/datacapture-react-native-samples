export default class CommonSettingsStore {
    static storeInstance = null;

    _store = {};

    static getInstance() {
        if (CommonSettingsStore.storeInstance == null) {
            CommonSettingsStore.storeInstance = new CommonSettingsStore();
        }

        return this.storeInstance;
    }

    getValueForKey(key) {
        return this._store[key] || null;
    }

    setValueForKey(key, value) {
        this._store[key] = value;
    }

    readData() {
        return Object.assign({}, this._store);
    }
}