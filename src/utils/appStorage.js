/**
 * @callback get
 * @argument {string} key
 * @returns {string | undefined}
 */

/**
 * @callback getToken
 * @returns {string | undefined}
 */

/**
 * @callback set
 * @argument {string} key
 * @argument {string} value
 */

/**
 * @callback setToken
 * @argument {string} token
 */

/**
 * @callback delete
 * @argument {string} key
 */

/**
 * @callback unsetToken
 */

/**
 * @callback getLastAuthInfo
 * @returns {{ token: string, type: 'user' | 'employee' } | null}
 */

/**
 * @typedef AppStorage
 * @property {get} get
 * @property {getToken} getUserToken
 * @property {getToken} getEmployeeToken
 * @property {set} set
 * @property {setToken} setUserToken
 * @property {setToken} setEmployeeToken
 * @property {delete} delete
 * @property {unsetToken} unsetUserToken
 * @property {unsetToken} unsetEmployeeToken
 * @property {getLastAuthInfo} getLastAuthInfo
 *
 */

/** @type {AppStorage} */
let instance;

const STORAGE_KEY = 'appointments_generic_storage_key';
const USER_TOKEN_KEY = 'USER_TOKEN';
const EMPLOYEE_TOKEN_KEY = 'EMPLOYEE_TOKEN';
const USER_LAST_LOGIN_DATE_KEY = 'USER_LAST_LOGIN_DATEY';
const EMPLOYEE_LAST_LOGIN_DATE_KEY = 'EMPLOYEE_LAST_LOGIN_DATE';

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
  instance.getUserToken = () => store[USER_TOKEN_KEY];
  instance.getEmployeeToken = () => store[EMPLOYEE_TOKEN_KEY];
  instance.set = (key, value) => {
    store[key] = value;
    storage.setItem(STORAGE_KEY, JSON.stringify(store));
  };
  instance.setUserToken = (token) => {
    store[USER_TOKEN_KEY] = token;
    store[USER_LAST_LOGIN_DATE_KEY] = new Date().toUTCString();
    storage.setItem(STORAGE_KEY, JSON.stringify(store));
  };
  instance.setEmployeeToken = (token) => {
    store[EMPLOYEE_TOKEN_KEY] = token;
    store[EMPLOYEE_LAST_LOGIN_DATE_KEY] = new Date().toUTCString();
    storage.setItem(STORAGE_KEY, JSON.stringify(store));
  };
  instance.getLastAuthInfo = () => {
    const employeeToken = store[EMPLOYEE_TOKEN_KEY];
    const employeeLastLogin = store[EMPLOYEE_LAST_LOGIN_DATE_KEY];
    const userToken = store[USER_TOKEN_KEY];
    const userLastLogin = store[USER_LAST_LOGIN_DATE_KEY];

    if (employeeToken && userToken) {
      if (!userLastLogin) {
        return { token: employeeToken, type: 'employee' };
      }
      if (!employeeLastLogin) {
        return { token: userToken, type: 'user' };
      }

      return new Date(userLastLogin) > new Date(employeeLastLogin)
        ? { token: userToken, type: 'user' }
        : { token: employeeToken, type: 'employee' };
    }

    if (employeeToken) {
      return { token: employeeToken, type: 'employee' };
    }

    if (userToken) {
      return { token: userToken, type: 'user' };
    }

    return null;
  };
  instance.delete = (key) => {
    delete store[key];
    storage.setItem(STORAGE_KEY, JSON.stringify(store));
  };
  instance.unsetUserToken = () => instance.delete(USER_TOKEN_KEY);
  instance.unsetEmployeeToken = () => instance.delete(EMPLOYEE_TOKEN_KEY);
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
