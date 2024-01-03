import { configureStore } from '@reduxjs/toolkit';
import apiKeys from './apiKeys';
import company from './companySlice';
import countries from './countriesSlice';
import providers from './serviceProvidersSlice';
import search from './searchSlice';
import subscriptions from './subscriptionsSlice';
import user from './userSlice';
import userLocation from './userLocationSlice';
import userPreferences from './userPreferences';

export const createStore = () => configureStore({
  reducer: {
    company,
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

export default store;
