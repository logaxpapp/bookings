/* eslint-disable-next-line */
import axios from 'axios';
import config from '../config';

const HOST = config.API_HOST;

const API = 'api/v1';

const url = (path, api = false) => {
  let url = path;
  if (api) {
    url = `${API}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  return new URL(url, HOST).href;
};

const authorization = (token) => (
  token ? ({ Authorization: `Bearer ${token}` }) : {}
);

const normalizeError = (err) => {
  if (!err) {
    return { message: 'An unknown error encountered. Please try again.' };
  }
  if (err.response) {
    return { message: err.response.data.message || JSON.stringify(err.response.data) };
  }
  if (err.request) {
    return { message: 'Server is not responding. One possibility is that CORS is disabled on server. Check your console to see' };
  }
  if (err.message) {
    return { message: err.message };
  }
  if (typeof err === 'string') {
    return { message: err };
  }
  return { message: 'An unknown error encountered. Please try again.' };
};

const instantiate = (headers = null) => {
  const config = { responseType: 'json' };
  if (headers) config.headers = headers;
  return axios.create(config);
};

/**
 * @param {string} path absolute url
 * @param {object} headers
 * @returns Promise that resolves to fetched data when request is successful
 * and rejects with error when request fails
 */
export const get = (path, headers = null) => new Promise((resolve, reject) => {
  instantiate(headers).get(path)
    .then(({ data }) => resolve(data))
    .catch((err) => reject(normalizeError(err)));
});

/**
 * @param {axios} instance An instance of axios to use for this request
 * @param {string} path relative url
 * @param {{ string: any }} data sent in body of this post
 * @returns Promise that resolves to fetched data when request is successful
 * and rejects with error when request fails
 */
const post = (path, data, headers = null) => new Promise((resolve, reject) => {
  instantiate(headers).post(path, data)
    .then(({ data }) => resolve(data))
    .catch((err) => reject(normalizeError(err)));
});

/**
 * @param {axios} instance An instance of axios to use for this request
 * @param {string} path relative url
 * @param {{ string: any }} data sent in body of this put
 * @returns Promise that resolves when request is successful
 * and rejects with error when request fails
 */
export const put = (path, data, headers = null) => new Promise((resolve, reject) => {
  instantiate(headers).put(path, data)
    .then(({ data }) => resolve(data))
    .catch((err) => reject(normalizeError(err)));
});

/**
 * @param {axios} instance An instance of axios to use for this request
 * @param {string} path relative url
 * @returns Promise that resolves if resource is successfully deleted
 * and rejects with error when request fails
 */
const destroy = (path, headers = null) => new Promise((resolve, reject) => {
  instantiate(headers).delete(path)
    .then(({ data }) => resolve(data))
    .catch((err) => reject(normalizeError(err)));
});

export const fetchResources = (route, token, api = false) => {
  if (token) {
    return get(url(route, api), authorization(token));
  }

  return get(url(route, api));
};

export const deleteResource = (token, route, api = false) => (
  destroy(url(route, api), authorization(token))
);

export const postResource = (token, route, data, api = false) => (
  post(url(route, api), data, authorization(token))
);

export const updateResource = (token, route, data, api = false) => (
  put(url(route, api), data, authorization(token))
);

export const postForm = (route, data) => post(url(`/${route}`), data);

export const authenticateCompany = (email, password) => (
  post(url('companies/auth/signin', true), { email, password })
);

export const authenticateUser = (email, password) => (
  post(url('users/auth/signin', true), { email, password })
);

export const registerCompany = (data) => post(url('companies/auth/signup', true), data);

export const registerUser = (data) => post(url('users/auth/signup', true), data);
