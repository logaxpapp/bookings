import axios from 'axios';
import { configureStore } from '@reduxjs/toolkit';
import apiKeys from './apiKeys';
import company, { teardown } from './companySlice';
import countries from './countriesSlice';
import providers from './serviceProvidersSlice';
import search from './searchSlice';
import subscriptions from './subscriptionsSlice';
import user, { setUser } from './userSlice';
import userLocation from './userLocationSlice';
import userPreferences from './userPreferences';
import controls from './controls';
import { notification } from '../utils';

export const createStore = () => configureStore({
  reducer: {
    company,
    controls,
    countries,
    providers,
    search,
    subscriptions,
    user,
    userLocation,
    userPreferences,
    apiKeys,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

const store = createStore();

// logout when token expires
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      notification.showError('Your authentication token has expired. Please login to continue!');
      store.dispatch(teardown);
      store.dispatch(setUser(null));
    }
  },
);

export default store;
