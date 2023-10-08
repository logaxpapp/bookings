/**
 * @callback get
 * @argument {string} key
 * @returns {string | undefined}
 */

/**
 * @callback set
 * @argument {string} key
 * @argument {string} value
 */

/**
 * @callback delete
 * @argument {string} key
 */

/**
 * @typedef AppStorage
 * @property {get} get
 * @property {set} set
 * @property {delete} delete
 *
 */

/** @type {AppStorage} */
let instance;

const STORAGE_KEY = 'appointments_generic_storage_key';

const init = (storage = localStorage) => {
  let store;
  try {
    const temp = storage.getItem(STORAGE_KEY);
    if (temp) {
      store = JSON.parse(temp);
    }
  } catch {
    // No action required
  }

  if (!store) {
    store = Object.create(null);
  }

  instance = Object.create(null);
  instance.get = (key) => store[key];
  instance.set = (key, value) => {
    store[key] = value;
    storage.setItem(STORAGE_KEY, JSON.stringify(store));
  };
  instance.delete = (key) => {
    delete store[key];
    storage.setItem(STORAGE_KEY, JSON.stringify(store));
  };
};

const AppStorage = {
  getInstance: (storage = localStorage) => {
    if (!instance) {
      init(storage);
    }

    return instance;
  },
};

export default AppStorage;
