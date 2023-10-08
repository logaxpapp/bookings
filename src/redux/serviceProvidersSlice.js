import { createSlice } from '@reduxjs/toolkit';
import { fetchResources } from '../api';
import { notification } from '../lib/Notification';

//  While it is inefficient to hit the server
//  each time user visits a company or browse a service,
//  We should consider memory consumption and stale data.
const MAX_CACHED_PROVIDERS = 0;
const MAX_CACHED_SLOTS = 0;

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name: 'providers',
  initialState: {
    companies: [],
    timeSlotIds: [],
    timeSlots: {},
  },
  reducers: {
    addCompany: (state, { payload }) => {
      if (MAX_CACHED_PROVIDERS && state.companies.length >= MAX_CACHED_PROVIDERS
      ) {
        state.companies.shift();
      }

      state.companies.push(payload);
    },
    setSlotsForDate: (state, {
      payload: { key, slots },
    }) => {
      if (MAX_CACHED_SLOTS) {
        const keys = Object.keys(state.timeSlotIds);
        if (keys.length >= MAX_CACHED_SLOTS) {
          const keyToRemove = state.timeSlotIds.shift();
          const newSlots = keys.reduce((memo, key) => {
            if (key === keyToRemove) {
              return memo;
            }
            memo[key] = state.timeSlots[key];
            return memo;
          }, {});
          newSlots[key] = slots;
          state.timeSlots = newSlots;
          return;
        }
      }
      state.timeSlots[key] = slots;
      state.timeSlotIds.push(key);
    },
    removeProviderTimeSlot: (state, { payload: { key, id } }) => {
      const slots = state.timeSlots[key];
      if (slots) {
        state.timeSlots[key] = slots.filter((slot) => slot.id !== id);
      }
    },
  },
});
/* eslint-enable no-param-reassign */

export const {
  addCompany,
  removeProviderTimeSlot,
  setSlotsForDate,
} = slice.actions;

export const getProviderAsync = (id, callback) => (dispatch, getState) => {
  const { providers: { companies } } = getState();

  const provider = companies.find((c) => c.id === id);
  if (provider) {
    callback(null, provider);
    return; // Maybe we also store time this data was retrieved and determine if it stale or not.
  }

  fetchResources(`companies/${id}`, null, true)
    .then((company) => {
      dispatch(addCompany(company));
      callback(null, company);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const getServiceTimeSlotsAsync = (
  serviceId, date, callback,
) => (dispatch, getState) => {
  const { providers: { timeSlots } } = getState();
  const key = `${date}${serviceId}`;
  const slots = timeSlots[key];
  if (slots) {
    callback(null, slots);
    return; // Comment in getProviderAsync also applies.
  }

  fetchResources(`services/${serviceId}/time_slots?date=${date}`, null, true)
    .then((slots) => {
      dispatch(setSlotsForDate({ key, slots }));
      callback(null, slots);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const selectProviders = (state) => state.providers.companies;
export const selectTimeSlots = (state) => state.providers.timeSlots;
export const selectProviderTimeSlots = (providerId) => (state) => (
  state.timeSlots[providerId]
);

export default slice.reducer;
