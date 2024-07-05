import { createSlice } from '@reduxjs/toolkit';
import { fetchResources } from '../api';

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name: 'subscriptions',
  initialState: {
    items: null,
    loading: false,
    error: null,
    features: null,
    loadingFeatures: false,
    featuresError: null,
  },
  reducers: {
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setSubscriptions: (state, { payload }) => {
      state.items = payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, { payload }) => {
      state.error = payload;
      state.loading = false;
    },
    setLoadingFeatures: (state, { payload }) => {
      state.loadingFeatures = payload;
    },
    setFeatures: (state, { payload }) => {
      state.features = payload;
      state.loadingFeatures = false;
      state.featuresError = null;
    },
    setFeaturesError: (state, { payload }) => {
      state.featuresError = payload;
      state.loadingFeatures = false;
    },
  },
});
/* eslint-enable no-param-reassign */

export const {
  setLoading,
  setError,
  setSubscriptions,
  setFeatures,
  setFeaturesError,
  setLoadingFeatures,
} = slice.actions;

export const loadSubscriptionPlansAsync = (countryCode, callback) => (dispatch) => {
  let path = 'subscription_plans';

  if (countryCode) {
    path += `?country_code=${countryCode}`;
  }

  dispatch(setLoading(true));

  fetchResources(path, null, true)
    .then((res) => {
      const { plans } = res;
      dispatch(setSubscriptions(plans));
      if (callback) {
        callback();
      }
    })
    .catch(({ message }) => {
      dispatch(setError(message || 'Could NOT load resources!'));
      if (callback) {
        callback(message);
      }
    });
};

export const loadSubscriptionFeaturesAsync = (callback) => (dispatch) => {
  dispatch(setLoadingFeatures(true));

  fetchResources('feature_texts', null, true)
    .then((features) => {
      dispatch(setFeatures(features));
      if (callback) {
        callback();
      }
    })
    .catch(({ message }) => {
      dispatch(setFeaturesError(message || 'Could NOT load features!'));
      if (callback) {
        callback(message);
      }
    });
};

export const selectSubscriptions = (state) => state.subscriptions.items;

export const selectLoadingSubscriptions = (state) => state.subscriptions.loading;

export const selectSubscriptionsError = (state) => state.subscriptions.error;

export const selectFeatures = (state) => state.subscriptions.features;

export const selectLoadingFeatures = (state) => state.subscriptions.loadingFeatures;

export const selectFeaturesError = (state) => state.subscriptions.featuresError;

export default slice.reducer;
