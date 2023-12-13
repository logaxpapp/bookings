/**
 * @callback Save
 * @argument {string} key
 * @argument {Object} value
 * @returns {void}
 */

/**
 * @callback NamedSave
 * @argument {Object} value
 * @returns {void}
 */

/**
 * @typedef Preferences
 * @property {string} searchParams
 * @property {{ id:number, name:string, url:string }[]} bookmarkedCompanies
 * @property {Save} save
 * @property {NamedSave} saveSearchParams
 * @property {NamedSave} bookmarkCompany
 * @property {NamedSave} deleteBookmarkedCompany
 */

/** @type {Preferences} */
let instance;

const STORAGE_KEY = 'user_preferences';

const SEARCH_PARAMS = 'searchParams';

const BOOKMARKED_COMPANIES = 'bookmarkedCompanies';

const save = (storage, key, value) => {
  instance[key] = value;
  storage.setItem(STORAGE_KEY, JSON.stringify(instance));
};

const init = (storage = localStorage) => {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      instance = JSON.parse(raw);
    }
  } catch {
    // No action required
  }

  if (!instance) {
    instance = {};
  }

  if (!instance.bookmarkedCompanies) {
    instance.bookmarkedCompanies = [];
  }

  instance.save = (key, value) => save(storage, key, value);
  instance.saveSearchParams = (value) => save(storage, SEARCH_PARAMS, value);
  instance.bookmarkCompany = (company) => save(
    storage,
    BOOKMARKED_COMPANIES,
    [...instance.bookmarkedCompanies, company],
  );
  instance.deleteBookmarkedCompany = (id) => save(
    storage,
    BOOKMARKED_COMPANIES,
    instance.bookmarkedCompanies.filter((c) => c.id !== id),
  );
};

const Preferences = {
  getInstance: (storage = localStorage) => {
    if (!instance) {
      init(storage);
    }

    return instance;
  },
};

export const searchParamsOptions = {
  DEVICE_LOCATION: 'current_location',
  HOME_LOCATION: 'home_location',
  NETWORK_LOCATION: 'network_location',
  User_CITY: 'user_city',
};

export default Preferences;
