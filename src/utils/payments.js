import stripeIcon from '../assets/images/stripe-icon.png';
import paystackIcon from '../assets/images/paystack.png';

// eslint-disable-next-line import/prefer-default-export
export const paymentMethods = [
  {
    id: 'stripe',
    name: 'Stripe',
    slogan: 'Financial Infrastructure for the Internet',
    icon: stripeIcon,
  },
  {
    id: 'paystack',
    name: 'Paystack',
    slogan: 'Modern online and offline payments for Africa',
    icon: paystackIcon,
  },
];
