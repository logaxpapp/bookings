import PropTypes from 'prop-types';
import css from './style.module.css';
import {
  PayStackButton,
  StripeButton,
} from './buttons';

const PaymentMethodSelector = ({ onSelect }) => (
  <section className={css.container}>
    <h1 className={css.heading}>Please Select A Payment Platform</h1>
    <div className={css.body}>
      <StripeButton onClick={onSelect} />
      <PayStackButton onClick={onSelect} />
    </div>
  </section>
);

PaymentMethodSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default PaymentMethodSelector;
