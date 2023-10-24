import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useOutletContext } from 'react-router';
import css from './style.module.css';
import { useNotification } from '../../../lib/Notification';
import PaymentMethodSelector from '../../../payments/PaymentMethodSelector';
import payments from '../../../payments';
import { Loader } from '../../../components/LoadingSpinner';
import { loadSubscriptionAsync, selectToken } from '../../../redux/companySlice';
import routes from '../../../routing/routes';

const SubscriptionRenewal = () => {
  const [busy, setBusy] = useState();
  const notification = useNotification();
  const [company] = useOutletContext();
  const token = useSelector(selectToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
      (err) => {
        if (err) {
          setBusy(false);
        } else {
          dispatch(loadSubscriptionAsync(() => {
            setBusy(false);
            navigate(routes.company.absolute.setup);
          }));
        }
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
