/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'controls',
  initialState: {
    isServiceEditorOpen: false,
    reAuthenticating: false,
  },
  reducers: {
    setServiceEditorOpen: (state, { payload }) => {
      state.isServiceEditorOpen = payload;
    },
    setReAuthenticating: (state, { payload }) => {
      state.reAuthenticating = payload;
    },
  },
});

export const {
  setServiceEditorOpen,
  setReAuthenticating,
} = slice.actions;

export const selectIsServiceEditorOpen = (state) => state.controls.isServiceEditorOpen;
export const selectReAuthenticating = (state) => state.controls.reAuthenticating;

export default slice.reducer;
