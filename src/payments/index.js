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
      default:
        return null;
    }
  },
};

export default payments;
