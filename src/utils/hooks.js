import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { selectUser } from '../redux/userSlice';
import { performSearchAsync } from '../redux/searchSlice';
import { selectSearchParams } from '../redux/userPreferences';
import { searchParamsOptions } from './userPreferences';
import UserLocation from './userLocation';
import { useUserDetailsDialog } from '../components/UserDetailsForm';
import { postResource } from '../api';
import BlankPage from '../components/BlankPage';
import { Loader } from '../components/LoadingSpinner';
import { useDialog } from '../lib/Dialog';
import defaultImages from './defaultImages';
import {
  addressText,
  camelCase,
  currencyHelper,
  notification,
} from '.';
import paystackIcon from '../assets/images/paystack.png';
import stripeIcon from '../assets/images/stripe-icon.png';
import { serviceProps } from './propTypes';
import payments from '../payments';
import { loadIPLocationAsync, setLoading } from '../redux/userLocationSlice';
import { CompanyRefundPolicy } from '../containers/ReturnPolicy';
import { SvgButton, colors, paths } from '../components/svg';
import { selectCompany, updatePreferencesAsync } from '../redux/companySlice';

/* eslint-disable no-nested-ternary */

const icons = {
  stripe: stripeIcon,
  paystack: paystackIcon,
};

const userLocation = UserLocation.getLocation();

const styles = {
  body: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  flexBody: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  innerBody: {
    width: '100%',
    maxWidth: 320,
    padding: '12px 24px',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  heading: {
    display: 'block',
    fontWeight: 'bold',
    fontSize: '1.2rem',
  },
  companyPanel: {
    display: 'flex',
    gap: 4,
  },
  pictureWrap: {
    width: 60,
    height: 60,
    backgroundColor: '#000',
  },
  picture: {
    width: '100%',
    height: '100%',
  },
  companyDetails: {
    minHeight: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  companyName: {
    fontSize: '0.9rem',
  },
  companyAddress: {
    fontSize: '0.7rem',
    opacity: 0.7,
  },
  serviceDeposit: {
    fontSize: '0.7rem',
    fontWeight: 'bold',
  },
  paymentMethodsHeading: {
    fontSize: '0.8rem',
  },
  methodsList: {
    margin: 0,
    padding: '12px 0',
    listStyle: 'none',
    maxHeight: 160,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  methodIcon: {
    height: 16,
  },
  controls: {
    padding: 4,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  errorPanel: {
    display: 'flex',
    flexDirection: 'column',
    margin: 4,
    padding: 8,
    maxHeight: 180,
    boxShadow: 'rgba(0, 0, 0, 0.24) 0 3px 8px',
  },
  errorBody: {
    flex: 1,
    overflow: 'auto',
  },
  errorControls: {
    paddingTop: 12,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
  },
};

const PaymentMethodRow = ({ name, onClick }) => {
  const handleClick = useCallback(() => onClick(name), [name, onClick]);

  return (
    <button type="button" className="payment-method-btn" onClick={handleClick}>
      <img src={icons[name]} alt={name} style={styles.methodIcon} />
      <span>{name}</span>
    </button>
  );
};

PaymentMethodRow.propTypes = {
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

const PaymentDialog = ({
  service,
  token,
  data,
  slotId,
  onClose,
  onResponse,
}) => {
  const [busy, setBusy] = useState(true);
  const [policyMode, setPolicyMode] = useState(false);
  const { address } = useMemo(() => ({
    address: addressText(service.company.address),
  }), [service]);

  const togglePolicyMode = useCallback(() => setPolicyMode((mode) => !mode));

  const handleClose = useCallback(() => onResponse(new Error('User cancelled action')), []);

  const handleMethodSelected = useCallback((name) => {
    const handler = payments.getHandler(name);
    if (!handler) {
      onResponse(new Error('Unknown Payment Provider!'));
      return;
    }

    setBusy(true);
    handler.deposit(token, slotId, data, {
      companyName: service.company.name,
      companyAddress: addressText(service.company.address),
      companyProfilePicture: service.company.profilePicture || defaultImages.profile,
    }, () => {
      setBusy(false);
      onClose();
    }, (err) => {
      onResponse(err);
    });
  }, []);

  useEffect(() => {
    setBusy(false);
  }, []);

  if (policyMode) {
    return (
      <>
        <CompanyRefundPolicy company={service.company} />
        <SvgButton
          type="button"
          title="Close"
          color={colors.delete}
          path={paths.close}
          onClick={togglePolicyMode}
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            pointerEvents: 'all',
          }}
        />
      </>
    );
  }

  return (
    <BlankPage className="z-999999">
      <div style={busy ? styles.body : styles.flexBody}>
        {busy ? (
          <Loader type="double_ring" color="transparent" />
        ) : service.company.enabledPaymentMethods.length > 1 ? (
          <section style={styles.innerBody}>
            <h1 style={styles.heading}>{service.name}</h1>
            <article style={styles.companyPanel}>
              <div style={styles.pictureWrap}>
                <img
                  alt={service.company.name}
                  src={service.company.profilePicture || defaultImages.profile}
                  style={styles.picture}
                />
              </div>
              <div style={styles.companyDetails}>
                <span style={styles.companyName}>{service.company.name}</span>
                <span style={styles.companyAddress}>{address}</span>
              </div>
            </article>
            <div style={styles.serviceDeposit}>
              {`A minimum deposit of ${service.company.country.currencyCode} ${currencyHelper.toString(service.minDeposit, service.company.country.currencySymbol)} is required on this service.`}
            </div>
            <div style={styles.paymentMethodsHeading}>
              Please Select A Payment Method Below To Proceed
            </div>
            <ul className="p-3 m-0 flex flex-col gap-1 max-h-40 overflow-auto border border-slate-300">
              {service.company.enabledPaymentMethods.map((name) => (
                <li key={name}>
                  <PaymentMethodRow name={name} onClick={handleMethodSelected} />
                </li>
              ))}
            </ul>
            <div>
              <span>By proceeding with this payment, you agree with the company&apos;s&nbsp;</span>
              <button type="button" className="link compactlink" onClick={togglePolicyMode}>
                Return Policy
              </button>
            </div>
            <div style={styles.controls}>
              <button type="button" className="control-btn cancel" onClick={handleClose}>
                Cancel
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </BlankPage>
  );
};

PaymentDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onResponse: PropTypes.func.isRequired,
  service: serviceProps.isRequired,
  data: PropTypes.shape({}).isRequired,
  slotId: PropTypes.number.isRequired,
  token: PropTypes.string,
};

PaymentDialog.defaultProps = {
  token: null,
};

export const useSearch = () => {
  const user = useSelector(selectUser);
  const searchParams = useSelector(selectSearchParams);
  const dispatch = useDispatch();

  const search = useCallback((term, cityId, forceCurrentLocation) => {
    const data = { term };
    if (cityId) {
      data.type = 'city';
      data.city_id = cityId;
      dispatch(performSearchAsync(data));
      return;
    }

    if (forceCurrentLocation) {
      userLocation.getCurrentLocation()
        .then(({ latitude, longitude }) => {
          data.type = 'location';
          data.latitude = latitude;
          data.longitude = longitude;
          dispatch(performSearchAsync(data));
        })
        .catch(({ message }) => notification.showError(message));
      return;
    }

    if (user) {
      let canDispatch = false;
      if (searchParams === searchParamsOptions.User_CITY && user.address) {
        canDispatch = true;
        data.type = 'city';
        data.city_id = user.address.city.id;
      } else if (
        searchParams === searchParamsOptions.HOME_LOCATION
        && userLocation.hasData
      ) {
        data.type = 'location';
        data.latitude = userLocation.latitude;
        data.longitude = userLocation.longitude;
        canDispatch = true;
      }

      if (canDispatch) {
        dispatch(performSearchAsync(data));
        return;
      }

      if (searchParams === searchParamsOptions.NETWORK_LOCATION) {
        dispatch(setLoading(true));
        loadIPLocationAsync((err, loc) => {
          if (err) {
            notification.showError('Error performing search!');
          } else {
            data.type = 'location';
            data.latitude = loc.latitude;
            data.longitude = loc.longitude;
            dispatch(performSearchAsync(data));
          }
        });
        return;
      }
    }

    userLocation.getCurrentLocation()
      .then(({ latitude, longitude }) => {
        data.type = 'location';
        data.latitude = latitude;
        data.longitude = longitude;
        dispatch(performSearchAsync(data));
      })
      .catch(({ message }) => notification.showError(message));
  }, [searchParams, user]);

  return search;
};

export const useBook = () => {
  /* eslint-disable-next-line */
  const dialog = useDialog();
  const user = useSelector(selectUser);
  const userDialog = useUserDetailsDialog();

  const getUserInfo = useCallback(() => new Promise((resolve, reject) => {
    if (user) {
      resolve({ token: user.token, data: { user_id: user.id } });
      return;
    }

    const successSubmit = (data, callback) => {
      callback();

      resolve({ token: null, data });
    };

    const failureCancel = () => reject(new Error('User cancelled action.'));

    userDialog.show(successSubmit, failureCancel);
  }), [user]);

  const bookSlot = useCallback((token, id, data, callback) => {
    postResource(token, `time_slots/${id}/appointments`, data, true)
      .then((appointment) => callback(null, appointment))
      .catch(({ message }) => {
        notification.showError(message);
        callback(message);
      });
  }, []);

  const book = useCallback((slot, service, callback) => {
    const { company, minDeposit } = service;
    const {
      enabledPaymentMethods: methods,
      permissions: { acceptsDeposit },
    } = company;

    if (minDeposit && acceptsDeposit && methods && methods.length) {
      getUserInfo()
        .then(({ token, data }) => {
          let popup;
          const handleClose = () => {
            popup.close();
            popup = null;
          };

          const handleResponse = (err) => {
            if (popup) {
              popup.close();
              popup = null;
            }
            callback(err);
          };

          popup = dialog.show(
            <PaymentDialog
              onClose={handleClose}
              onResponse={handleResponse}
              service={service}
              token={token}
              data={data}
              slotId={slot.id}
            />,
          );
        })
        .catch((err) => callback(err));
    } else {
      getUserInfo()
        .then(({ token, data }) => bookSlot(token, slot.id, data, callback))
        .catch((err) => callback(err));
    }
  }, [getUserInfo]);

  return book;
};

/**
 * @param {Array<string>} keys field keys
 */
export const usePrefereceFields = (keys) => {
  const [busy, setBusy] = useState(false);
  const company = useSelector(selectCompany);
  const camelCases = useMemo(() => keys.reduce((memo, key) => ({
    ...memo,
    [key]: camelCase(key),
  }), {}), []);
  const [fields, setFields] = useState(() => keys.reduce((memo, key) => ({
    ...memo,
    [key]: company.preferences[camelCases[key]],
  }), {}));
  const { data, hasChanges } = useMemo(() => {
    const changed = keys.reduce((memo, key) => {
      const rslt = memo;
      if (company.preferences[camelCases[key]] !== fields[key]) {
        rslt[key] = fields[key];
      }

      return rslt;
    }, {});

    return { data: changed, hasChanges: !!Object.keys(changed).length };
  }, [fields, company.preferences]);
  const dispatch = useDispatch();

  const update = useCallback((extras = null) => {
    if (!hasChanges) {
      return;
    }

    const params = extras ? { ...data, ...extras } : data;

    setBusy(true);
    dispatch(updatePreferencesAsync(params, () => {
      setBusy(false);
    }));
  }, [data, hasChanges]);

  return {
    busy,
    data,
    fields,
    hasChanges,
    preferences: company.preferences,
    setFields,
    update,
  };
};

/* eslint-enable no-nested-ternary */
