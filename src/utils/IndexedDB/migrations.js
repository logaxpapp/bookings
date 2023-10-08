const tables = {
  PREFERENCES: 'preferences',
};

// Add new migrations to the end of array below.
// We want to keep track of all our migrations. We don't delete them.
// Each time we add a migration the version increases automatically;

const migrationListeners = [
  /**
   * @param {IDBVersionChangeEvent} e
   */
  (e) => {
    /** @type {IDBDatabase} */
    const db = e.target.result;

    const keyStore = db.createObjectStore(tables.PREFERENCES, {
      keyPath: 'key',
    });

    keyStore.createIndex('value', 'value', { unique: 'false' });
  },
];

const VERSION = migrationListeners.length;

const migrations = {
  get tables() { return tables; },
  get upgradeListener() { return migrationListeners[VERSION - 1]; },
  get VERSION() { return VERSION; },
};

export default migrations;
