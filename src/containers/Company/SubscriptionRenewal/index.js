import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useOutletContext } from 'react-router';
import css from './style.module.css';
import { useNotification } from '../../../lib/Notification';
import PaymentMethodSelector from '../../../payments/PaymentMethodSelector';
import payments from '../../../payments';
import { Loader } from '../../../components/LoadingSpinner';
import { selectToken } from '../../../redux/companySlice';

const SubscriptionRenewal = () => {
  const [busy, setBusy] = useState();
  const notification = useNotification();
  const [company] = useOutletContext();
  const token = useSelector(selectToken);

  const handleSelection = useCallback((method) => {
    const handler = payments.getHandler(method);
    if (!handler) {
      notification.showError('Unknown payment provider selected');
      return;
    }

    setBusy(true);
    handler.subscribe(
      company.id,
      token,
      () => setBusy(false),
      () => {
        setBusy(false);
      },
    );
  }, []);

  return (
    <section className={css.container}>
      {busy ? (
        <Loader type="double_ring">
          <span>Connecting To Server ...</span>
        </Loader>
      ) : (
        <PaymentMethodSelector onSelect={handleSelection} />
      )}
    </section>
  );
};

export default SubscriptionRenewal;
