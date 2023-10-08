export const countries = [
  {
    id: 1,
    name: 'USA',
    code: 'US',
    currency: 'Dollar',
    currencySymbol: '$',
  },
  {
    id: 2,
    name: 'Nigeria',
    code: 'NG',
    currency: 'Naira',
    currencySymbol: '₦',
  },
];

export const latlong = [
  {
    id: 1,
    countryId: 1,
    maxLatitude: 30.09,
    minLatitude: 24.54,
    maxLongitude: -80.02,
    minLongitude: -84.02,
  },
  {
    id: 2,
    countryId: 1,
    maxLatitude: 41.68,
    minLatitude: 25.95,
    maxLongitude: -69.62,
    minLongitude: -97.14,
  },
  {
    id: 3,
    countryId: 1,
    maxLatitude: 48.9995,
    minLatitude: 25.946,
    maxLongitude: -97.275,
    minLongitude: -97.277,
  },
  {
    id: 4,
    countryId: 1,
    maxLatitude: 48.9995,
    minLatitude: 25.9215,
    maxLongitude: -97.277,
    minLongitude: -97.357,
  },
  {
    id: 5,
    countryId: 1,
    maxLatitude: 48.9995,
    minLatitude: 25.836,
    maxLongitude: -97.357,
    minLongitude: -97.4571,
  },
  {
    id: 6,
    countryId: 1,
    maxLatitude: 48.9995,
    minLatitude: 25.875,
    maxLongitude: -97.4571,
    minLongitude: -97.72,
  },
  /* http://www.naturalearthdata.com/downloads/10m-cultural-vectors/ */
  {
    id: 7,
    countryId: 1,
    maxLatitude: 71.39,
    minLatitude: 5.87,
    maxLongitude: -66.9,
    minLongitude: -180.0,
  },
  {
    id: 8,
    countryId: 2,
    maxLatitude: 13.89,
    minLatitude: 4.28,
    maxLongitude: 14.28,
    minLongitude: 2.66,
  },
];

/**
 *
 * @param {Object} param
 * @param {number} param.latitude
 * @param {number} param.longitude
 * @returns {{ id: number, name: string, code: string, currency: string, currencySymbol: string }[]}
 */
export const getCountries = ({ latitude, longitude }) => latlong.reduce((prev, current) => {
  if (!prev.find((country) => country.id === current.countryId)) {
    if (
      latitude >= current.minLatitude
      && latitude <= current.maxLatitude
      && longitude >= current.minLongitude
      && longitude <= current.maxLongitude
    ) {
      const c = countries.find((c1) => c1.id === current.countryId);
      if (c) {
        prev.push(c);
      }
    }
  }

  return prev;
}, []);

/**
 * @param {Object} param
 * @param {number} param.latitude
 * @param {number} param.longitude
 * @returns {string | undefined}
 */
export const getCountryCode = ({ latitude, longitude }) => {
  const location = latlong.find((loc) => (
    latitude >= loc.minLatitude
    && latitude <= loc.maxLatitude
    && longitude >= loc.minLongitude
    && longitude <= loc.maxLongitude
  ));

  if (!location) {
    return undefined;
  }

  const country = countries.find((c) => c.id === location.countryId);
  return (country && country.code) || undefined;
};
