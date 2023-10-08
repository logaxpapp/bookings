import { createSlice } from '@reduxjs/toolkit';
import { getCountryCode } from '../utils/countries';

const isLocationAvaliable = !!window.navigator.geolocation;

export const locationErrorTypes = {
  NONE: 0,
  PERMISSION_DENIED: 1,
  NOT_AVAILABLE: 2,
  TIMED_OUT: 3,
  UNKNOWN: 4,
};

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name: 'userLocation',
  initialState: {
    item: null,
    loading: false,
    error: locationErrorTypes.NONE,
  },
  reducers: {
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setLocation: (state, { payload }) => {
      state.item = payload;
      state.error = locationErrorTypes.NONE;
      state.loading = false;
    },
    setError: (state, { payload }) => {
      state.error = payload;
      state.loading = false;
    },
  },
});
/* eslint-enable no-param-reassign */

export const {
  setLoading,
  setError,
  setLocation,
} = slice.actions;

export const loadUserLocationAsync = (callback) => (dispatch, getState) => {
  const { userLocation: { item } } = getState();
  if (item) {
    if (callback) {
      callback(null, item);
    }

    return;
  }

  dispatch(setLoading(true));

  if (!isLocationAvaliable) {
    dispatch(setError(locationErrorTypes.NOT_AVAILABLE));
    if (callback) {
      callback('Location is NOT available!');
    }
    return;
  }

  window.navigator.geolocation.getCurrentPosition(
    (position) => {
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      const countryCode = getCountryCode(location);
      if (countryCode.length) {
        // eslint-disable-next-line
        location.countryCode = countryCode;
      }
      dispatch(setLocation(location));

      if (callback) {
        callback(null, location);
      }
    },
    (err) => {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          dispatch(setError(locationErrorTypes.PERMISSION_DENIED));
          break;
        case err.POSITION_UNAVAILABLE:
          dispatch(setError(locationErrorTypes.NOT_AVAILABLE));
          break;
        case err.TIMEOUT:
          dispatch(setError(locationErrorTypes.TIMED_OUT));
          break;
        default:
          dispatch(setError(locationErrorTypes.UNKNOWN));
      }

      callback(err.message);
    },
  );
};

export const selectUserLocation = (state) => state.userLocation.item;

export const selectLoadingUserLocation = (state) => state.userLocation.loading;

export const selectUserLocationError = (state) => state.userLocation.error;

export default slice.reducer;
