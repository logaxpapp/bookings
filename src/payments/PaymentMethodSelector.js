import PropTypes from 'prop-types';
import css from './style.module.css';
import {
  StripeButton,
} from './buttons';

// const StripeButton = ({ onClick }) => {
//   const handleClick = useCallback(() => onClick('stripe'), []);

//   return (
//     <button
//       type="button"
//       className={css.icon}
//       onClick={handleClick}
//     >
//       <img src={stripeIcon} alt="stripe" />
//     </button>
//   );
// };

// StripeButton.propTypes = {
//   onClick: PropTypes.func.isRequired,
// };

const PaymentMethodSelector = ({ onSelect }) => (
  <section className={css.container}>
    <h1 className={css.heading}>Please Select A Payment Platform</h1>
    <div className={css.body}>
      <StripeButton onClick={onSelect} />
    </div>
  </section>
);

PaymentMethodSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default PaymentMethodSelector;
