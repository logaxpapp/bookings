import { createSlice } from '@reduxjs/toolkit';
import { postResource } from '../api';
import { notification } from '../utils';

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name: 'search',
  initialState: {
    results: [],
    loading: false,
    error: '',
  },
  reducers: {
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setResults: (state, { payload }) => {
      state.results = payload;
      state.loading = false;
      state.error = '';
    },
    setError: (state, { payload }) => {
      state.error = payload;
      state.loading = false;
    },
  },
});
/* eslint-enable no-param-reassign */

export const {
  setError,
  setLoading,
  setResults,
} = slice.actions;

export const performSearchAsync = (data) => (dispatch) => {
  dispatch(setLoading(true));
  postResource(null, 'services/search', data, true)
    .then((services) => dispatch(setResults(services)))
    .catch(({ message }) => {
      notification.showError('Failed to load search results!');
      dispatch(setError(message));
    });
};

export const selectSearchResults = (state) => state.search.results;

export const selectSearching = (state) => state.search.loading;

export const selectSearchError = (state) => state.search.error;

export default slice.reducer;
