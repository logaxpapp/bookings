import { createSlice } from '@reduxjs/toolkit';
import UserPreferences from '../utils/userPreferences';

const preferences = UserPreferences.getInstance();

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name: 'userPreferences',
  initialState: {
    searchParams: preferences.searchParams,
    bookmarkedCompanies: [...preferences.bookmarkedCompanies],
  },
  reducers: {
    setSearchParams: (state, { payload }) => {
      preferences.saveSearchParams(payload);
      state.searchParams = payload;
    },
    bookmarkCompany: (state, { payload }) => {
      preferences.bookmarkCompany(payload);
      state.bookmarkedCompanies.push(payload);
    },
    deleteBookmarkedCompany: (state, { payload }) => {
      if (typeof payload === 'number') {
        preferences.deleteBookmarkedCompany(payload);
        state.bookmarkedCompanies = state.bookmarkedCompanies.filter(({ id }) => id !== payload);
      } else if (Array.isArray(payload)) {
        payload.forEach((id) => {
          preferences.deleteBookmarkedCompany(id);
        });

        state.bookmarkedCompanies = state.bookmarkedCompanies.filter(
          ({ id }) => !payload.includes(id),
        );
      }
    },
  },
});
/* eslint-enable no-param-reassign */

export const {
  deleteBookmarkedCompany,
  bookmarkCompany,
  setSearchParams,
} = slice.actions;

export const selectBookmarkedCompanies = (state) => state.userPreferences.bookmarkedCompanies;

export const selectSearchParams = (state) => state.userPreferences.searchParams;

export default slice.reducer;
