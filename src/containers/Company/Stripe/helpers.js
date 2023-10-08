import AppStorage from '../../../utils/appStorage';

const storage = AppStorage.getInstance();

const stripeHelpers = {
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

export default stripeHelpers;
