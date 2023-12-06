import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSlice } from '@reduxjs/toolkit';
import { getCountryCode } from '../utils/countries';
import { fetchResources } from '../api';
import { notification } from '../utils';

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
    location: '',
    loadingLocation: false,
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
    setUserLocation: (state, { payload }) => {
      state.location = payload;
      state.loadingLocation = false;
    },
    setLoadingLocation: (state, { payload }) => {
      state.loadingLocation = payload;
    },
  },
});
/* eslint-enable no-param-reassign */

export const {
  setLoading,
  setError,
  setLocation,
  setUserLocation,
  setLoadingLocation,
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

export const loadIPLocationAsync = (callback) => (dispatch, getState) => {
  const { userLocation: { item } } = getState();
  if (item) {
    if (callback) {
      callback(null, item);
    }

    return;
  }

  dispatch(setLoading(true));

  fetchResources('user_locations', null, true)
    .then((location) => {
      dispatch(setLocation(location));
      callback(null, location);
    })
    .catch((err) => {
      notification.showError('Failed to load location!');
      dispatch(setLoading(false));
      callback(err);
    });
};

export const getUserLocation = () => new Promise((resolve, reject) => {
  if (!isLocationAvaliable) {
    reject(new Error('Location is NOT available!'));
    return;
  }

  window.navigator.geolocation.getCurrentPosition(
    (position) => {
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    }, (err) => {
      notification.showError(err.message);
      reject(err);
    },
    { enableHighAccuracy: true },
  );
});

export const selectUserLocation = (state) => state.userLocation.item;

export const selectLoadingUserLocation = (state) => state.userLocation.loading;

export const selectUserLocationError = (state) => state.userLocation.error;

export const selectLocation = (state) => state.userLocation.location;

export const selectLoadingLocation = (state) => state.userLocation.loadingLocation;

const paused = false;

export const useUserLocation = () => {
  /** @type {{ city: string, country: string, region: string }} */
  const location = useSelector(selectLocation);
  const busy = useSelector(selectLoadingLocation);
  const dispatch = useDispatch();

  useEffect(() => {
    if (paused) {
      return;
    }

    if (!location) {
      if (!busy) {
        dispatch(setLoadingLocation(true));
        fetchResources('user_locations', null, true)
          .then((location) => dispatch(setUserLocation(location)))
          .catch(() => setTimeout(() => dispatch(setLoadingLocation(false)), 60000));
      }
    }
  }, [busy, location]);

  return location;
};

export default slice.reducer;
