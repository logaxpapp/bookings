import { createSlice } from '@reduxjs/toolkit';
import { fetchResources } from '../api';

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name: 'apiKeys',
  initialState: {
    keys: null,
  },
  reducers: {
    setKeys: (state, { payload }) => {
      state.keys = payload;
    },
  },
});
/* eslint-disable no-param-reassign */

export const {
  setKeys,
} = slice.actions;

export const getApiKeysAsync = (callback) => (dispatch, getState) => {
  const { apiKeys: { keys } } = getState();
  if (keys) {
    callback(null, keys);
    return;
  }

  fetchResources('external_api_keys', null, true)
    .then((keys) => {
      dispatch(setKeys(keys));
      callback(null, keys);
    })
    .catch(({ message }) => {
      callback(message);
    });
};

export default slice.reducer;
