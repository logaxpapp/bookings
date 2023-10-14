import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import css from './style.module.css';
import {
  clearIpInfo,
  loadSubscriptionPlansAsync,
  selectSubscriptions,
} from '../../../redux/subscriptionsSlice';
import { Loader } from '../../../components/LoadingSpinner';
import routes from '../../../routing/routes';
import { currencyHelper } from '../../../utils';
import { subscriptionProps } from '../../../utils/propTypes';

export const starterFeatures = [
  '1 company account', 'Email reminders', 'Accept deposits', 'Zero processing fee',
  'Auto scheduling', 'Custom schedules',
];

export const standardFeatures = [
  'Starter +', '5 employee accounts', 'SMS reminders',
  'google calendar integration', 'instant messaging with clients',
];

export const premiumFeatures = [
  'Standard +', 'Unlimited employee accounts', 'Employee insight reports',
];

const features = [starterFeatures, standardFeatures, premiumFeatures];

const Plan = ({
  plan,
  mostPopular,
  left,
  onSelect,
  isUpdate,
}) => {
  const [price, setPrice] = useState('');

  useEffect(() => {
    setPrice(currencyHelper.toString(100 * plan.price, plan.currencySymbol));
  }, []);

  const handleClik = useCallback((e) => {
    e.preventDefault();
    onSelect({ priceId: plan.priceId, countryId: plan.countryId });
  }, []);

  if (mostPopular) {
    return (
      <article className={css.standard_article}>
        <span className={css.most_popular}>Most popular</span>
        <div className={css.standard_body}>
          <div>
            <h1 className={css.plan_heading}>{plan.name}</h1>
            <div className={css.price_row}>
              <span className={css.price}>{price}</span>
              <span className={css.periodicity}>/ m</span>
            </div>
            <div className={css.features_panel}>
              {plan.features.map((feature) => (
                <span key={feature} className={css.feature}>{feature}</span>
              ))}
            </div>
          </div>
          <div className={css.plan_footer}>
            {isUpdate ? null : (
              <div className={css.free_period_wrap}>
                <span className={css.free_period}>
                  {`${plan.freePeriod} month${plan.freePeriod === 1 ? '' : 's'} free trial`}
                </span>
              </div>
            )}
            <Link
              to={routes.company.absolute.registration}
              state={{ priceId: plan.priceId, countryId: plan.countryId }}
              className={css.register_link}
              onClick={handleClik}
            >
              {isUpdate ? 'Choose Plan' : 'Get Started'}
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className={`${css.article_wrap} ${left ? css.left : css.right}`}>
      <article className={`${css.plan_article} ${left ? css.left : css.right}`}>
        <div>
          <h1 className={css.plan_heading}>{plan.name}</h1>
          <div className={css.price_row}>
            <span className={css.price}>{price}</span>
            <span className={css.periodicity}>/ m</span>
          </div>
          <div className={css.features_panel}>
            {plan.features.map((feature) => (
              <span key={feature} className={css.feature}>{feature}</span>
            ))}
          </div>
        </div>
        <div className={css.plan_footer}>
          {isUpdate ? null : (
            <div className={css.free_period_wrap}>
              <span className={css.free_period}>
                {`${plan.freePeriod} month${plan.freePeriod === 1 ? '' : 's'} free trial`}
              </span>
            </div>
          )}
          <Link
            to={routes.company.absolute.registration}
            state={{ priceId: plan.priceId, countryId: plan.countryId }}
            className={css.register_link}
            onClick={handleClik}
          >
            {isUpdate ? 'Choose Plan' : 'Get Started'}
          </Link>
        </div>
      </article>
    </div>
  );
};

Plan.propTypes = {
  plan: PropTypes.shape({
    name: PropTypes.string,
    currencySymbol: PropTypes.string,
    price: PropTypes.string,
    priceId: PropTypes.number,
    countryId: PropTypes.number,
    freePeriod: PropTypes.number,
    features: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  left: PropTypes.bool,
  mostPopular: PropTypes.bool,
  isUpdate: PropTypes.bool,
};

Plan.defaultProps = {
  left: false,
  mostPopular: false,
  isUpdate: false,
};

export const SubscriptionPlans = ({ subscriptions, onSelect, isUpdate }) => {
  const [plans, setPlans] = useState();

  useEffect(() => {
    if (subscriptions) {
      const plans = subscriptions.map((plan) => {
        const clone = {
          id: plan.id,
          name: plan.name,
          currencySymbol: '',
          price: '',
          priceId: 0,
          countryId: 0,
          freePeriod: plan.freePeriod,
        };

        if (plan.prices && plan.prices.length) {
          const price = plan.prices[0];
          clone.price = price.amount;
          clone.priceId = price.id;
          clone.countryId = price.country.id;
          clone.currencySymbol = price.country.currencySymbol;
        }

        return clone;
      });

      plans.sort((a, b) => {
        if (a.price < b.price) {
          return -1;
        }
        if (a.price > b.price) {
          return 1;
        }
        return 0;
      });

      setPlans(plans.map((plan, idx) => ({ ...plan, features: features[idx] })));
    }
  }, [subscriptions, setPlans]);

  if (!plans) {
    return (
      <div className={css.loading_panel}>
        <Loader type="double_ring" />
      </div>
    );
  }

  return (
    <section className={css.container}>
      {plans.map((plan, idx) => (
        <Plan
          key={plan.id}
          plan={plan}
          left={idx === 0}
          mostPopular={idx === 1}
          onSelect={onSelect}
          isUpdate={isUpdate}
        />
      ))}
    </section>
  );
};

SubscriptionPlans.propTypes = {
  onSelect: PropTypes.func.isRequired,
  isUpdate: PropTypes.bool,
  subscriptions: PropTypes.arrayOf(subscriptionProps),
};

SubscriptionPlans.defaultProps = {
  isUpdate: false,
  subscriptions: null,
};

const Subscriptions = () => {
  const [countryName, setCountryName] = useState('');
  const subscriptions = useSelector(selectSubscriptions);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!subscriptions) {
      dispatch(loadSubscriptionPlansAsync());
    } else if (subscriptions.length) {
      const subscription = subscriptions[0];
      if (subscription.prices && subscription.prices.length) {
        setCountryName(subscription.prices[0].country.name);
      }
    }
  }, []);

  const handleClearMemo = useCallback(() => {
    dispatch(clearIpInfo());
    window.location.reload();
  }, []);

  const handleSelection = useCallback((state) => {
    navigate(routes.company.absolute.registration, { state });
  }, []);

  return (
    <div>
      {countryName ? (
        <div className={css.country_notice}>
          <span>
            {`Our System detected that you are in ${countryName}. If this were NOT the case, you may need to disable your VPN (if you are using one) and/or`}
          </span>
          <button
            type="button"
            className="link compact-link"
            style={{ fontSize: '0.9rem' }}
            onClick={handleClearMemo}
          >
            &nbsp;clear&nbsp;
          </button>
          <span>
            your device memoized location before continuing.
          </span>
          <br />
          <span className={`warning bold ${css.discovery_warning}`}>
            Please NOTE that it is only users searching from your
            registered location that can discover you services.
          </span>
        </div>
      ) : null}
      <SubscriptionPlans
        subscriptions={subscriptions}
        onSelect={handleSelection}
      />
    </div>
  );
};

export default Subscriptions;
