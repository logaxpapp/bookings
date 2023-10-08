import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import css from './styles.module.css';
import { useNotification } from '../../../lib/Notification';
import { SubscriptionPlans } from '../../Pricing/Subscription';
import { selectCompany, selectSubscription, updateSubscriptionAsync } from '../../../redux/companySlice';
import { loadSubscriptionPlansAsync, selectSubscriptions } from '../../../redux/subscriptionsSlice';
import { Loader } from '../../../components/LoadingSpinner';
import routes from '../../../routing/routes';

const UpdateRegistrationPage = () => {
  const [busy, setBusy] = useState('');
  const [prompt, setPrompt] = useState('');
  const company = useSelector(selectCompany);
  const subscriptions = useSelector(selectSubscriptions);
  const subscription = useSelector(selectSubscription);
  const dispatch = useDispatch();
  const notification = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    setPrompt(
      `You are currently subscribed to the ${subscription.name} plan. Please choose a subscription plan below`,
    );
    if (!subscriptions) {
      dispatch(loadSubscriptionPlansAsync(company.country.code));
    }
  }, []);

  const handleSelection = useCallback((data) => {
    if (data.priceId === subscription.price.id) {
      notification.showInfo('You selected the plan you are currently subscribed to. No further action is required.');
      return;
    }

    setBusy(true);
    dispatch(updateSubscriptionAsync(subscription, data, (err) => {
      setBusy(false);
      if (!err) {
        notification.showSuccess('Your subscription was successfully updated.');
        navigate(routes.company.absolute.setup);
      }
    }));
  }, []);

  return (
    <main className={css.main}>
      <header className={`${css.page_header} ${css.subscription}`}>
        <h1 className={css.page_heading}>Update Subscription Plan</h1>
        <h2 className={css.sub_heading}>{prompt}</h2>
      </header>
      <div className={`${css.content} ${css.subscription}`}>
        {busy ? (
          <Loader type="double_ring">
            <span>Updating Subscription ...</span>
          </Loader>
        ) : (
          <SubscriptionPlans
            subscriptions={subscriptions}
            onSelect={handleSelection}
            isUpdate
          />
        )}
      </div>
    </main>
  );
};

export default UpdateRegistrationPage;
