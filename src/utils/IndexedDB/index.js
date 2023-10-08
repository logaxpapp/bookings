import migrations from './migrations';

/**
 * @callback GetMethod
 * @argument {string} key
 * @returns {Promise<string>}
 */

/**
 * @callback GetMethodNoArgs
 * @returns {Promise<string>}
 */

/**
 * @callback SetMethod
 * @argument {string} key
 * @argument {string} value
 * @returns {Promise<void>}
 */

/**
 * @typedef Preferences
 * @property {GetMethod} get
 * @property {SetMethod} set
 */

/**
 * @typedef {Object} IndexedDB
 * @property {Preferences} preferences
 * @property {GetMethodNoArgs} getUserWallpaper
 * @property {SetMethod} setUserWallpaper
 */

/** @type {IndexedDB} */
let instance;

const USER_WALLPAPER_KEY = 'user_wallpaper_key';

/**
 * @param {IDBDatabase} db
 * @returns {Preferences}
 */
const initPreference = (db) => {
  const store = {};
  const table = migrations.tables.PREFERENCES;

  const get = (key) => new Promise((resolve, reject) => {
    if (key in store) {
      resolve(store[key]);
      return;
    }

    const transaction = db.transaction([table]);

    const objectStore = transaction.objectStore(table);

    objectStore.openCursor().addEventListener('success', (e) => {
      /** @type {IDBCursor} */
      const cursor = e.target.result;

      if (cursor) {
        const { key: dbKey, value } = cursor.value.key;
        if (dbKey === key) {
          store[key] = value;
          resolve(value);
        } else {
          cursor.continue();
        }
      } else {
        reject(new Error('Record not found2!'));
      }
    });
  });

  const set = (key, value) => new Promise((resolve, reject) => {
    const transaction = db.transaction([table], 'readwrite');

    const objectStore = transaction.objectStore(table);

    const request = objectStore.add({ key, value });

    request.addEventListener('success', () => {
      store[key] = value();
      resolve();
    });

    transaction.addEventListener('complete', () => {});

    transaction.addEventListener('error', reject);
  });

  return { get, set };
};

const DB_NAME = 'LOGAXP_APPOINTMENTS_DATABASE';

/**
 * @param {IDBFactory} factory
 * @returns {Promise<IndexedDB>}
 */
const init = (factory = window.indexedDB) => new Promise((resolve, reject) => {
  const openRequest = factory.open(DB_NAME, migrations.VERSION);
  openRequest.addEventListener('error', () => reject(new Error('Database failed to open')));

  openRequest.addEventListener('success', (e) => {
    instance = Object.create(null);
    const preferences = initPreference(e.target.result);
    instance.preferences = preferences;
    instance.getUserWallpaper = () => preferences.get(USER_WALLPAPER_KEY);
    instance.setUserWallpaper = (value) => preferences.set(USER_WALLPAPER_KEY, value);

    resolve(instance);
  });
  openRequest.addEventListener('upgradeneeded', migrations.upgradeListener);
});

const IndexedDB = {
  /**
   * @param {IDBFactory} factory
   */
  getInstance: (factory = window.indexedDB) => {
    if (instance) {
      return Promise.resolve(instance);
    }

    return init(factory);
  },
};

export default IndexedDB;
