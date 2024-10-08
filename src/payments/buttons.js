import { useCallback } from 'react';
import PropTypes from 'prop-types';
import css from './style.module.css';
import stripeIcon from '../assets/images/stripe-icon.png';
import paystackPng from '../assets/images/paystack-logo.png';

export const StripeButton = ({ onClick }) => {
  const handleClick = useCallback(() => onClick('stripe'), []);

  return (
    <button
      type="button"
      className={css.icon_btn}
      onClick={handleClick}
    >
      <img src={stripeIcon} alt="stripe" />
      <svg viewBox="0 0 943 187" fill="none" xmlns="http://www.w3.org/2000/svg" className={css.stripe_svg}>
        <title>An image of the Stripe logo</title>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M447 96.1048C447 64.3182 431.603 39.2366 402.176 39.2366C372.624 39.2366 354.744 64.3182 354.744 95.8565C354.744 133.231 375.852 152.104 406.149 152.104C420.925 152.104 432.1 148.751 440.543 144.033V119.2C432.1 123.421 422.415 126.029 410.122 126.029C398.078 126.029 387.4 121.807 386.034 107.156H446.752C446.752 105.541 447 99.0848 447 96.1048ZM385.662 84.309C385.662 70.2782 394.229 64.4424 402.052 64.4424C409.626 64.4424 417.697 70.2782 417.697 84.309H385.662Z"
          fill="#0A2540"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M306.816 39.2366C294.648 39.2366 286.825 44.9482 282.48 48.9216L280.865 41.2232H253.549V186.001L284.59 179.42L284.715 144.281C289.185 147.51 295.765 152.104 306.692 152.104C328.918 152.104 349.157 134.224 349.157 94.8631C349.033 58.8549 328.545 39.2366 306.816 39.2366ZM299.366 124.787C292.04 124.787 287.695 122.18 284.715 118.951L284.59 72.8857C287.819 69.2848 292.289 66.8015 299.366 66.8015C310.665 66.8015 318.488 79.4665 318.488 95.7323C318.488 112.371 310.79 124.787 299.366 124.787Z"
          fill="#0A2540"
        />
        <path
          d="M242.001 41.3474H210.835V149.993H242.001V41.3474Z"
          fill="#0A2540"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M177.435 50.5357L175.448 41.3474H148.628V149.993H179.67V76.3624C186.995 66.8015 199.412 68.5399 203.261 69.9057V41.3474C199.288 39.8574 184.76 37.1258 177.435 50.5357Z"
          fill="#0A2540"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M115.351 14.4033L85.0539 20.86L84.9297 120.317C84.9297 138.694 98.7122 152.228 117.089 152.228C127.271 152.228 134.721 150.366 138.818 148.131V122.925C134.845 124.539 115.226 130.251 115.226 111.874V67.7949H138.818V41.3474H115.226L115.351 14.4033Z"
          fill="#0A2540"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M31.4142 72.8857C31.4142 68.0432 35.3875 66.1807 41.9683 66.1807C51.405 66.1807 63.325 69.0365 72.7617 74.1273V44.9482C62.4558 40.8507 52.2742 39.2366 41.9683 39.2366C16.7625 39.2366 0 52.3982 0 74.3757C0 108.646 47.1833 103.182 47.1833 117.958C47.1833 123.67 42.2167 125.532 35.2633 125.532C24.9575 125.532 11.7958 121.311 1.36583 115.599V145.151C12.9133 150.117 24.585 152.228 35.2633 152.228C61.09 152.228 78.8458 139.439 78.8458 117.213C78.7217 80.2115 31.4142 86.7923 31.4142 72.8857Z"
          fill="#0A2540"
          style={{ display: 'none' }}
        />
      </svg>
    </button>
  );
};

StripeButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export const PayStackButton = ({ onClick }) => {
  const handleClick = useCallback(() => onClick('paystack'), []);

  return (
    <button
      type="button"
      className={css.icon_btn}
      onClick={handleClick}
    >
      <img src={paystackPng} alt="paystack" />
    </button>
  );
};

PayStackButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
