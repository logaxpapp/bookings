import { createSlice } from '@reduxjs/toolkit';
import { fetchResources } from '../api';

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name: 'subscriptions',
  initialState: {
    items: null,
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
      state.error = null;
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
  setSubscriptions,
} = slice.actions;

export const loadSubscriptionPlansAsync = (countryCode, callback) => (dispatch) => {
  let path = 'subscription_plans';

  if (countryCode) {
    path += `?country_code=${countryCode}`;
  }

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

export const selectSubscriptions = (state) => state.subscriptions.items;

export const selectLoadingSubscriptions = (state) => state.subscriptions.loading;

export const selectSubscriptionsError = (state) => state.subscriptions.error;

export default slice.reducer;
