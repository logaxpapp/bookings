/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'controls',
  initialState: {
    isServiceEditorOpen: false,
    reAuthenticating: false,
    loadCount: 0,
  },
  reducers: {
    setServiceEditorOpen: (state, { payload }) => {
      state.isServiceEditorOpen = payload;
    },
    setReAuthenticating: (state, { payload }) => {
      state.reAuthenticating = payload;
    },
    setLoading: (state, { payload }) => {
      if (payload) {
        state.loadCount += 1;
      } else {
        let count = state.loadCount - 1;
        if (count < 0) {
          count = 0;
        }
        state.loadCount = count;
      }
    },
  },
});

export const {
  setServiceEditorOpen,
  setReAuthenticating,
  setLoading,
} = slice.actions;

export const selectIsServiceEditorOpen = (state) => state.controls.isServiceEditorOpen;
export const selectReAuthenticating = (state) => state.controls.reAuthenticating;
export const selectBusy = (state) => state.controls.loadCount > 0;

export default slice.reducer;
