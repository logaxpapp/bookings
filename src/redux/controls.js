/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'controls',
  initialState: {
    isServiceEditorOpen: false,
  },
  reducers: {
    setServiceEditorOpen: (state, { payload }) => {
      state.isServiceEditorOpen = payload;
    },
  },
});

export const {
  setServiceEditorOpen,
} = slice.actions;

export const selectIsServiceEditorOpen = (state) => state.controls.isServiceEditorOpen;

export default slice.reducer;
