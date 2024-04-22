/**
 * @callback AsyncReload
 * @returns {Promise<{latitude: number, longitude: number, lastSaved: Date}>}
 */

/**
 * @callback SaveFunction
 * @param {number} latitude
 * @param {number} longitude
 */

/**
 * @typedef {Object} Location
 * @property {boolean} isFromLocalStorage
 * @property {boolean} isAvailable
 * @property {boolean} hasData
 * @property {boolean} isValid
 * @property {number} latitude
 * @property {number} longitude
 * @property {Date} lastSaved
 * @property {number} error
 * @property {AsyncReload} reload
 * @property {AsyncReload} getCurrentLocation
 * @property {SaveFunction} save
 */

export const locationErrorTypes = {
  NONE: 0,
  PERMISSION_DENIED: 1,
  NOT_AVAILABLE: 2,
  TIMED_OUT: 3,
  UNKNOWN: 4,
};

/** @type {Location} */
let instance;

const STORAGE_KEY = 'user_location_storage_key';

const init = (
  storage = window.localStorage,
  geolocation = window.navigator.geolocation,
) => {
  instance = {};
  instance.isAvailable = !!geolocation;
  instance.isFromLocalStorage = false;
  instance.hasData = false;
  instance.isValid = false;

  const reload = () => new Promise((resolve, reject) => {
    if (!geolocation) {
      reject(locationErrorTypes.NOT_AVAILABLE);
    }

    geolocation.getCurrentPosition(
      (position) => {
        instance.latitude = position.coords.latitude;
        instance.longitude = position.coords.longitude;
        instance.isFromLocalStorage = false;
        const time = new Date();
        instance.lastSaved = time;
        instance.hasData = true;
        instance.isValid = true;
        storage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            lastSaved: time.toISOString(),
          }),
        );
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          lastSaved: time,
        });
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            instance.error = locationErrorTypes.PERMISSION_DENIED;
            break;
          case err.POSITION_UNAVAILABLE:
            instance.error = locationErrorTypes.NOT_AVAILABLE;
            break;
          case err.TIMEOUT:
            instance.error = locationErrorTypes.TIMED_OUT;
            break;
          default:
            instance.error = locationErrorTypes.UNKNOWN;
        }
        reject(err);
      },
    );
  });

  instance.reload = reload;

  instance.getCurrentLocation = () => new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
      resolve({ latitude, longitude });
    }, (err) => reject(err));
  });

  instance.save = (latitude, longitude) => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        latitude,
        longitude,
        lastSaved: new Date().toISOString(),
      }),
    );
  };

  const raw = storage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const json = JSON.parse(raw);
      instance.latitude = json.latitude;
      instance.longitude = json.longitude;
      instance.lastSaved = new Date(json.lastSaved);
      instance.isFromLocalStorage = true;
      instance.hasData = !!json.lastSaved;
      instance.isValid = json.latitude && json.longitude;
    } catch {
      //
    }
  }
};

const UserLocation = {
  getLocation: (
    storage = window.localStorage,
    geolocation = window.navigator.geolocation,
  ) => {
    if (!instance) {
      init(storage, geolocation);
    }

    return instance;
  },
};

export default UserLocation;
