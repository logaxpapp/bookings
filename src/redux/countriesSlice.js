import { createSlice } from '@reduxjs/toolkit';
import { fetchResources } from '../api';
import { notification } from '../utils';

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name: 'countries',
  initialState: {
    items: null,
  },
  reducers: {
    setItems: (state, { payload }) => {
      state.items = payload;
    },
  },
});
/* eslint-enable no-param-reassign */

const {
  setItems,
} = slice.actions;

export const loadCountriesAsync = (callback) => (dispatch) => {
  fetchResources('countries', null, true)
    .then((countries) => {
      dispatch(setItems(countries));
      if (callback) {
        callback(null);
      }
    })
    .catch(({ message }) => {
      notification.showError(message);
      if (callback) {
        callback(message);
      }
    });
};

export const selectCountries = (state) => state.countries.items;

export default slice.reducer;
