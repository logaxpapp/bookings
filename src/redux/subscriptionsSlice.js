import { createSlice } from '@reduxjs/toolkit';
import { loadUserLocationAsync } from './userLocationSlice';
import { fetchResources } from '../api';
import AppStorage from '../utils/appStorage';

const appStorage = AppStorage.getInstance();
const IP_STORAGE_KEY = 'ipInfo';

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name: 'subscriptions',
  initialState: {
    items: null,
    ipInfo: null,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setSubscriptions: (state, { payload }) => {
      state.items = payload;
      state.loading = false;
    },
    setIpInfo: (state, { payload }) => {
      state.ipInfo = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload;
      state.loading = false;
    },
  },
});
/* eslint-enable no-param-reassign */

export const {
  setIpInfo,
  setLoading,
  setError,
  setSubscriptions,
} = slice.actions;

const fetchSubscriptionPlans = (dispatch, countryCode) => {
  fetchResources(`subscription_plans?country_code=${countryCode}`, null, true)
    .then((plans) => dispatch(setSubscriptions(plans)))
    .catch(({ message }) => dispatch(setError(message || 'Could NOT load resources!')));
};

export const loadSubscriptionsAsync = () => (dispatch, getState) => {
  const {
    subscriptions: { items, loading },
    userLocation: { item: location },
  } = getState();
  if (items || loading) {
    return;
  }

  dispatch(setLoading(true));

  if (location) {
    if (location.countryCode) {
      fetchSubscriptionPlans(dispatch, location.countryCode);
    }

    return;
  }

  dispatch(loadUserLocationAsync((err, loc) => {
    if (err) {
      dispatch(setError(err));
    } else {
      fetchSubscriptionPlans(dispatch, loc.countryCode);
    }
  }));
};

export const loadSubscriptionPlansAsync = (countryCode) => (dispatch) => {
  let path = 'subscription_plans';
  let savedIpInfo = null;

  if (countryCode) {
    path += `?country_code=${countryCode}`;
  } else {
    savedIpInfo = appStorage.get(IP_STORAGE_KEY);
    if (savedIpInfo) {
      try {
        savedIpInfo = JSON.parse(savedIpInfo);
        path += `?country_code=${savedIpInfo.country}`;
      } catch {
        // Data has been corrupted!
        appStorage.delete(savedIpInfo);
        savedIpInfo = null;
      }
    }
  }

  fetchResources(path, null, true)
    .then((res) => {
      const { ipInfo, plans } = res;
      dispatch(setSubscriptions(plans));
      if (savedIpInfo) {
        dispatch(setIpInfo(savedIpInfo));
      } else if (ipInfo) {
        try {
          const info = JSON.parse(ipInfo);
          dispatch(setIpInfo(info));
          appStorage.set(IP_STORAGE_KEY, ipInfo);
        } catch {
          // No action required
        }
      }
    })
    .catch(({ message }) => dispatch(setError(message || 'Could NOT load resources!')));
};

export const selectSubscriptions = (state) => state.subscriptions.items;

export const selectLoadingSubscriptions = (state) => state.subscriptions.loading;

export const selectSubscriptionsError = (state) => state.subscriptions.error;

export default slice.reducer;
