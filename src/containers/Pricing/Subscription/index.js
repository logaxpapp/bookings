import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import css from './style.module.css';
import {
  loadSubscriptionPlansAsync,
  selectSubscriptions,
} from '../../../redux/subscriptionsSlice';
import { Loader, useBusyDialog } from '../../../components/LoadingSpinner';
import routes from '../../../routing/routes';
import { currencyHelper, notification } from '../../../utils';
import { countryProps, subscriptionProps } from '../../../utils/propTypes';
import { loadCountriesAsync, selectCountries } from '../../../redux/countriesSlice';
import { SvgButton, colors, paths } from '../../../components/svg';
import { useDialog } from '../../../lib/Dialog';

const CHANGE_COUNTRY = 'change_country';
const COUNTRY = 'country';
const PROCEED = 'proceed';

const CountrySelector = ({ country, onClose, onSelect }) => {
  const [selectedCountry, setSelectedCountry] = useState(country);
  const [state, setState] = useState({
    loading: true,
    error: null,
  });
  const countries = useSelector(selectCountries);
  const dispatch = useDispatch();

  const loadCountries = useCallback(() => {
    setState((state) => ({ ...state, loading: true }));
    dispatch(loadCountriesAsync((err) => {
      let error = null;
      if (err) {
        error = 'Failed to load countries';
      }
      setState({ error, loading: false });
    }));
  }, [dispatch]);

  useEffect(() => {
    if (countries) {
      setState({ loading: false, error: null });
    } else {
      loadCountries();
    }
  }, []);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === COUNTRY) {
      setSelectedCountry(
        countries.find(({ id }) => id === Number.parseInt(value, 10)),
      );
    }
  }, [countries]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === PROCEED) {
      if (!selectedCountry) {
        notification.showIinfo('Please select a country!');
        return;
      }

      onSelect(selectedCountry);
      onClose();
    }
  });

  /* eslint-disable no-nested-ternary */
  return (
    <div className="modal">
      <div className="modal-bold-body">
        {state.loading ? (
          <div className={css.country_select_loader}>
            <span className="loader" />
          </div>
        ) : state.error ? (
          <>
            <p className={css.country_select_intro}>
              Application encountered an error while loading countries.
            </p>
            <button type="button" className={`link ${css.country_select_link}`} onClick={loadCountries}>
              Please click to reload
            </button>
          </>
        ) : (
          <>
            <p className={css.country_select_intro}>
              Please choose a different country below to proceed.
            </p>
            <label htmlFor={COUNTRY} className="bold-select">
              <select
                name={COUNTRY}
                id={COUNTRY}
                value={(selectedCountry && selectedCountry.id) || ''}
                onChange={handleValueChange}
              >
                <option value="" disabled>Select Country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              name={PROCEED}
              className={css.submit_btn}
              onClick={handleClick}
            >
              register in selected country
            </button>
          </>
        )}
        <SvgButton
          type="button"
          title="Close"
          color={colors.delete}
          path={paths.close}
          onClick={onClose}
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        />
      </div>
    </div>
  );
  /* eslint-enable no-nested-ternary */
};

CountrySelector.propTypes = {
  country: countryProps,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

CountrySelector.defaultProps = {
  country: null,
};

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
    setPrice(currencyHelper.toString(plan.price, plan.currencySymbol));
  }, [plan]);

  const handleClik = useCallback((e) => {
    e.preventDefault();
    onSelect({
      name: plan.name,
      priceId: plan.priceId,
      countryId: plan.countryId,
      priceAmount: plan.price,
    });
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
    price: PropTypes.number,
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
  }, [subscriptions]);

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

const Subscriptions = ({ showNotice }) => {
  const [country, setCountry] = useState('');
  const subscriptions = useSelector(selectSubscriptions);
  const busyDialog = useBusyDialog();
  const dialog = useDialog();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!subscriptions) {
      dispatch(loadSubscriptionPlansAsync());
    } else if (showNotice && subscriptions.length) {
      const subscription = subscriptions[0];
      if (subscription.prices && subscription.prices.length) {
        setCountry(subscription.prices[0].country);
      }
    }
  }, []);

  const changeCountry = useCallback((newCountry) => {
    if (country && newCountry && newCountry.id === country.id) {
      return;
    }

    const popup = busyDialog.show('Loading Subscriptions ...');
    dispatch(loadSubscriptionPlansAsync(newCountry.code, (err) => {
      if (err) {
        notification.showError(`Failed to load subscriptions for ${newCountry.name}!`);
      } else {
        setCountry(newCountry);
      }
      popup.close();
    }));
  }, [country]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CHANGE_COUNTRY) {
      let popup;
      const handleClose = () => popup.close();
      popup = dialog.show(
        <CountrySelector country={country} onSelect={changeCountry} onClose={handleClose} />,
      );
    }
  }, [country, dialog]);

  const handleSelection = useCallback((state) => {
    navigate(routes.company.absolute.registration, { state });
  }, []);

  return (
    <div>
      {country ? (
        <div className={css.country_notice}>
          <span>
            {`Your company will be registered in ${country.name}. Note that you are visible only in your country of registration.`}
          </span>
          <button
            type="button"
            name={CHANGE_COUNTRY}
            className="link compact-link"
            style={{ fontSize: '0.9rem' }}
            onClick={handleClick}
          >
            &nbsp;Please click to change&nbsp;
          </button>
          <span>
            if this is not your country.
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

Subscriptions.propTypes = {
  showNotice: PropTypes.bool,
};

Subscriptions.defaultProps = {
  showNotice: false,
};

export default Subscriptions;
