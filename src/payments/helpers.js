import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppStorage from '../utils/appStorage';

const storage = AppStorage.getInstance();

export const stripeHelpers = {
  getRequestParams: (id, type, exclude) => {
    const raw = storage.get(`${type}_payment_intent_${id}`);

    /**
     * @type {{
     * publishableKey: string, clientSecret: string, connectedAccountId: string,
     * token: string, ticketId: string, companyName: string, companyAddress: string,
     * companyProfilePicture: string, hasError: boolean
     * }}
     */
    let data;
    if (raw) {
      data = JSON.parse(raw);
      if (data) {
        const excluded = exclude || [];
        const props = ['clientSecret', 'connectedAccountId', 'publishableKey', 'ticketId', 'token'];
        for (let i = 0; i < props.length; i += props.length) {
          if (!data[props[i]] && excluded.indexOf(props[i]) < 0) {
            data.hasError = true;
          }
        }
      }
    }

    if (!data) {
      data = {
        hasError: true,
        publishableKey: '',
        clientSecret: '',
        connectedAccountId: '',
        ticketId: '',
        token: '',
      };
    }

    return data;
  },
  clear: (id) => {
    storage.delete(`deposit_payment_intent_${id}`);
  },
};

export const paystackStorageHelpers = {
  getParams: (reference, exclude) => {
    const raw = storage.get(reference);

    /**
     * @type {{
     * intentId: number, connectedAccountId: string,
     * token: string, ticketId: string, companyName: string, companyAddress: string,
     * companyProfilePicture: string, hasError: boolean
     * }}
     */
    let data;
    if (raw) {
      data = JSON.parse(raw);
      if (data) {
        const excluded = exclude || [];
        const props = ['intentId', 'connectedAccountId', 'ticketId', 'token'];
        for (let i = 0; i < props.length; i += props.length) {
          if (!data[props[i]] && excluded.indexOf(props[i]) < 0) {
            data.hasError = true;
          }
        }
      }
    }

    if (!data) {
      data = {
        hasError: true,
        publishableKey: '',
        clientSecret: '',
        connectedAccountId: '',
        ticketId: '',
        token: '',
      };
    }

    return data;
  },
  clear: (reference) => {
    storage.delete(reference);
  },
};

/**
 * @returns {{
 * loaded: boolean,
 * hasError: boolean,
 * intentId: number,
 * connectedAccountId: string,
 * token: string,
 * type: string,
 * ticketId: string,
 * companyName: string,
 * companyAddress: string,
 * companyProfilePicture: string
 * }}
 */
export const usePaystackStoredParams = () => {
  const [params, setParams] = useState({ loaded: false });
  const [queryParams] = useSearchParams();

  useEffect(() => {
    const reference = queryParams.get('reference');
    if (reference) {
      setParams({ loaded: true, ...paystackStorageHelpers.getParams(reference) });
    }
  }, []);

  return params;
};
