import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import css from './style.module.css';
import Header from '../Header';
import Subscriptions from './Subscription';
import PublicRouteContainer from '../PublicRouteContainer';
import {
  loadSubscriptionFeaturesAsync, loadSubscriptionPlansAsync,
  selectFeatures, selectFeaturesError, selectLoadingFeatures,
  selectLoadingSubscriptions, selectSubscriptions, selectSubscriptionsError,
} from '../../redux/subscriptionsSlice';
import { Loader } from '../../components/LoadingSpinner';
import ResourceLoader from '../../components/ResourceLoader';
import { prepareSubscriptionPlans } from '../../utils';
import { featureTextProps, planProps } from '../../utils/propTypes';

const SubscriptionsTableRow = ({ feature, plans }) => {
  const { startIndex } = useMemo(() => {
    let startIndex = -1;

    if (feature.plans.length) {
      startIndex = plans.findIndex((plan) => plan.id === feature.plans[0]);
    }

    return { startIndex };
  }, [feature, plans]);

  if (startIndex < 0) {
    return null;
  }

  return (
    <tr>
      <td className={css.feature}>
        <span>{feature.text}</span>
      </td>
      {plans.map((plan, idx) => (
        <td
          key={plan.id}
          aria-label={idx >= startIndex ? 'Included' : 'Excluded'}
        >
          {idx >= startIndex ? (
            <div className="inline-flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <title>check-circle</title>
                <path
                  fill="currentColor"
                  d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                />
              </svg>
            </div>
          ) : null}
        </td>
      ))}
    </tr>
  );
};

SubscriptionsTableRow.propTypes = {
  feature: featureTextProps.isRequired,
  plans: PropTypes.arrayOf(planProps).isRequired,
};

const SubscriptionsTable = () => {
  const subscriptions = useSelector(selectSubscriptions);
  const loadingSubscriptions = useSelector(selectLoadingSubscriptions);
  const subscriptionsError = useSelector(selectSubscriptionsError);
  const subscriptionFeatures = useSelector(selectFeatures);
  const loadingFeatures = useSelector(selectLoadingFeatures);
  const featuresError = useSelector(selectFeaturesError);
  const { features, plans } = useMemo(() => {
    let features = null;
    let plans = null;
    if (subscriptions && subscriptionFeatures) {
      plans = prepareSubscriptionPlans(subscriptions);
      features = subscriptionFeatures.filter((feature) => feature.isDisplayed);
    }

    return { features, plans };
  }, [subscriptions, subscriptionFeatures]);
  const dispatch = useDispatch();

  const reloadSubscriptions = useCallback(() => {
    dispatch(loadSubscriptionPlansAsync());
  }, [dispatch]);

  const reloadFeatures = useCallback(() => {
    dispatch(loadSubscriptionFeaturesAsync());
  }, [dispatch]);

  useEffect(() => {
    if (!subscriptions && !loadingSubscriptions && !subscriptionsError) {
      reloadSubscriptions();
    }

    if (!(subscriptionFeatures || loadingFeatures || featuresError)) {
      reloadFeatures();
    }
  }, []);

  if (loadingSubscriptions || loadingFeatures) {
    return (
      <div className="w-full h-12 pt-18 pb-12">
        <Loader type="double_ring" />
      </div>
    );
  }

  if (featuresError) {
    return (
      <div className="w-full h-12  pt-18 pb-12">
        <ResourceLoader />
      </div>
    );
  }

  if (featuresError) {
    return (
      <div className="w-full h-12  pt-18 pb-12">
        <ResourceLoader />
      </div>
    );
  }

  if (!(plans && features)) {
    return null;
  }

  return (
    <section className="pt-18 pb-12 w-full max-w-[1040px] mx-auto overflow-x-auto">
      <table className={css.table}>
        <thead>
          <tr>
            <th className={css.features_heading}>
              <span>Features</span>
            </th>
            {plans.map((plan) => (
              <th key={plan.id}>
                <span>{plan.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <SubscriptionsTableRow key={feature.id} feature={feature} plans={plans} />
          ))}
        </tbody>
      </table>
    </section>
  );
};

const Pricing = () => (
  <PublicRouteContainer>
    <div>
      <Header />
      <div className="px-6">
        <main role="main" className="max-w-280 mx-auto">
          <header className="flex flex-col items-center py-6">
            <h1 className={css.heading}>
              <span>Loga</span>
              <span className={css.accented}>XP</span>
              <span>&nbsp;Appointments</span>
            </h1>
            <p className="text-center">Let 10+ million of our users discover your business.</p>
          </header>
          <Subscriptions />
          <SubscriptionsTable />
        </main>
      </div>
    </div>
  </PublicRouteContainer>
);

export default Pricing;
