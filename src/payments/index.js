import Paystack from './Paystack';
import Stripe from './Stripe';

const payments = {
  /**
   * @param {string} identifier
   * returns
   */
  getHandler: (identifier) => {
    switch (identifier) {
      case 'stripe':
        return Stripe;
      case 'paystack':
        return Paystack;
      default:
        return null;
    }
  },
};

export default payments;
