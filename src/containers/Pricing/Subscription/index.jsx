import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { CheckBadgeIcon } from '@heroicons/react/20/solid';
import css from './style.module.css';
import {
  loadSubscriptionPlansAsync,
  selectLoadingSubscriptions,
  selectSubscriptions,
  selectSubscriptionsError,
} from '../../../redux/subscriptionsSlice';
import { Loader, useBusyDialog } from '../../../components/LoadingSpinner';
import routes from '../../../routing/routes';
import { currencyHelper, notification, prepareSubscriptionPlans } from '../../../utils';
import { countryProps, subscriptionProps } from '../../../utils/propTypes';
import { loadCountriesAsync, selectCountries } from '../../../redux/countriesSlice';
import { SvgButton, colors, paths } from '../../../components/svg';
import { useDialog } from '../../../lib/Dialog';
import ResourceLoader from '../../../components/ResourceLoader';
import GridPanel from '../../../components/GridPanel';

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

const Plan = ({
  plan,
  onSelect,
  isUpdate,
  isCurrent,
}) => {
  const [price, setPrice] = useState('');

  useEffect(() => {
    setPrice(currencyHelper.toString(plan.price, plan.currencySymbol));
  }, [plan]);

  const handleClik = useCallback((e) => {
    if (onSelect) {
      e.preventDefault();
      onSelect({
        id: plan.id,
        name: plan.name,
        priceId: plan.priceId,
        countryId: plan.countryId,
        priceAmount: plan.price,
      });
    }
  }, []);

  return (
    <div className="w-full px-1 py-2 flex justify-center z-[2]">
      <article className="w-75 pt-8 pb-6 px-5 rounded-xl bg-white text-center flex flex-col justify-between h-full relative shadow-[1px_4px_20px_0_rgba(0,0,0,.05)]">
        {isCurrent ? (
          <div
            aria-hidden="true"
            className="rounded-[3px] font-medium absolute top-4 -left-2.5 uppercase text-white text-xs w-[110px] h-[25px] flex items-center justify-center bg-[#89E101] after:absolute after:left-0 after:-bottom-[10px] after:h-0 after:w-0 after:-z-1 after:block after:border-t-[10px] after:border-t-[#89e101] after:border-x-[10px] after:border-x-transparent"
          >
            Current Plan
          </div>
        ) : null}
        <header className="flex flex-col items-center">
          <span className="w-13 h-13 bg-[#011c39] rounded-full flex items-center justify-center">
            <CheckBadgeIcon className="text-white w-6 h-6" />
          </span>
          <h1 className="uppercase pt-4 pb-8 font-bold text-base text-[#011c39]">
            <span className="block">{plan.name}</span>
            <div className="flex items-center">
              <span>{price}</span>
              <small className="text-xs">/ m</small>
            </div>
          </h1>
        </header>
        <div className="pb-4">
          <p className="m-0 text-base text-[#474a4f]">{plan.description}</p>
        </div>
        <div>
          <Link
            to={routes.company.absolute.registration}
            state={{ priceId: plan.priceId, countryId: plan.countryId }}
            className="block w-full uppercase border-0 text-center text-[#011c39] bg-[#1c74bc1a] rounded-[10px] p-4 font-bold text-xs leading-4"
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
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    currencySymbol: PropTypes.string,
    price: PropTypes.number,
    priceId: PropTypes.number,
    countryId: PropTypes.number,
    freePeriod: PropTypes.number,
    features: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  isUpdate: PropTypes.bool,
  isCurrent: PropTypes.bool,
};

Plan.defaultProps = {
  isUpdate: false,
  isCurrent: false,
};

export const SubscriptionPlans = ({
  subscriptions, onSelect,
  isUpdate, currentPriceId,
}) => {
  const [plans, setPlans] = useState();

  useEffect(() => {
    if (subscriptions) {
      setPlans(prepareSubscriptionPlans(subscriptions));
    }
  }, [subscriptions]);

  if (!plans) {
    return null;
  }

  return (
    <section className="w-full max-w-270 mx-auto">
      <GridPanel minimumChildWidth={308}>
        {plans.map((plan, idx) => (
          <Plan
            key={plan.id}
            plan={plan}
            left={idx === 0}
            mostPopular={idx === 1}
            onSelect={onSelect}
            isUpdate={isUpdate}
            isCurrent={currentPriceId === plan.priceId}
          />
        ))}
      </GridPanel>
    </section>
  );
};

SubscriptionPlans.propTypes = {
  onSelect: PropTypes.func.isRequired,
  isUpdate: PropTypes.bool,
  subscriptions: PropTypes.arrayOf(subscriptionProps),
  currentPriceId: PropTypes.number,
};

SubscriptionPlans.defaultProps = {
  isUpdate: false,
  subscriptions: null,
  currentPriceId: null,
};

const Subscriptions = ({ showNotice }) => {
  const [country, setCountry] = useState('');
  const error = useSelector(selectSubscriptionsError);
  const loading = useSelector(selectLoadingSubscriptions);
  const subscriptions = useSelector(selectSubscriptions);
  const busyDialog = useBusyDialog();
  const dialog = useDialog();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reload = useCallback(() => {
    dispatch(loadSubscriptionPlansAsync());
  }, [dispatch]);

  useEffect(() => {
    if (!subscriptions) {
      reload();
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

  if (loading) {
    return (
      <div className="relative w-full h-15">
        <Loader type="double_ring" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-15">
        <ResourceLoader resourceName="Subscription Plans" onReload={reload} />
      </div>
    );
  }

  if (!subscriptions) {
    return null;
  }

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
