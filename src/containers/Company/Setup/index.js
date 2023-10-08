import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import css from './styles.module.css';
import {
  loadCountriesAsync,
  selectCountries,
} from '../../../redux/countriesSlice';
import {
  selectSubscription,
  updateCompanyCityAsync,
  updateCompanyLocationAsync,
  updateCompanyImages,
  updateCompanyAsync,
  selectToken,
  setCompany,
} from '../../../redux/companySlice';
import {
  companyProps,
  countryProps,
} from '../../../utils/propTypes';
import UserLocation from '../../../utils/userLocation';
import { useBusyDialog } from '../../../components/LoadingSpinner';
import AlertComponent from '../../../components/AlertComponents';
import LoadingButton, { Ring } from '../../../components/LoadingButton';
import { SvgButton, colors, paths } from '../../../components/svg';
import ResourceLoader from '../../../components/ResourceLoader';
import { useNotification } from '../../../lib/Notification';
import {
  capitalize,
  currencyHelper,
  dateUtils,
  windowUtils,
} from '../../../utils';
import { isImage, uploadFile } from '../../../lib/CloudinaryUtils';
import ImageUploader from '../../../components/ImageUploader';
import defaultImages from '../../../utils/defaultImages';
import { SimpleCheckBox } from '../../../components/Inputs';
import { fetchResources } from '../../../api';
import GridPanel from '../../../components/GridPanel';
import routes from '../../../routing/routes';

const location = UserLocation.getLocation();

/**
 *
 * @param {Date} date
 * @returns
 */
const getLastSaved = (date) => `${date.toLocaleDateString()}T${date.toLocaleTimeString()}`;

const CITY = 'city';
const CLOSE_CITY_EDITOR = 'close city editor';
const CLOSE_LOCATION_EDITOR = 'close location editor';
const COUNTRY = 'country';
const OFFICE_CLOSE_TIME = 'office close time';
const OFFICE_START_TIME = 'office start time';
const OPEN_CITY_EDITOR = 'open city editor';
const OPEN_LOCATION_EDITOR = 'open location editor';
const SAVE = 'save';
const SETUP_PAYMENT = 'setup_payment';
const STATE = 'state';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

const paymentMethods = ['stripe'];

const PaymentsMethodRow = ({ name, company }) => {
  const [isEnrolled, setEnrolled] = useState(false);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const token = useSelector(selectToken);
  const notification = useNotification();
  const dispatch = useDispatch();

  useEffect(() => {
    setTitle(capitalize(name));
    setEnrolled(company.enabledPaymentMethods.includes(name));
  }, [name, company, setEnrolled, setTitle]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === SETUP_PAYMENT) {
      setBusy(true);
      fetchResources('stripe_connected_accounts/links', token, true)
        .then(({ url }) => {
          if (!url) {
            notification.showError('An error occurred while connecting to Stripe. If this error persists, please contact us using any of our contact platforms.');
            return;
          }

          windowUtils.open(url);
          const interval = setInterval(() => {
            fetchResources('stripe_connected_accounts/status', token, true)
              .then(({ status, hasActiveLink }) => {
                if (status === 'active') {
                  clearInterval(interval);
                  setBusy(false);
                  const methods = company.enabledPaymentMethods || [];
                  if (!methods.includes('stripe')) {
                    dispatch(setCompany({ ...company, enabledPaymentMethods: [...methods, 'stripe'] }));
                  }
                } else if (!hasActiveLink) {
                  clearInterval(interval);
                  setBusy(false);
                }
              })
              .catch(() => {});
          }, 90000);
        })
        .catch(({ message }) => {
          notification.showError(message);
          setBusy(false);
        });
    }
  }, [company, setBusy]);

  return (
    <div className={css.payment_row}>
      <span className={`${css.payment_row_label} ${isEnrolled ? css.enrolled : ''}`}>
        {title}
      </span>
      {isEnrolled ? null : (
        <>
          {busy ? (
            <Ring color="#1276f3" size={14} />
          ) : (
            <button
              type="button"
              name={SETUP_PAYMENT}
              className="link compact-link"
              onClick={handleClick}
            >
              Setup Option
            </button>
          )}
        </>
      )}
    </div>
  );
};

PaymentsMethodRow.propTypes = {
  name: PropTypes.string.isRequired,
  company: companyProps.isRequired,
};

const PaymentsPanel = ({ company }) => {
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    setEnrolled(!!company.enabledPaymentMethods.length);
  }, [company, setEnrolled]);

  return (
    <section className={`${css.card} ${css.section} ${css.payment_section}`}>
      <div className={css.section_header_wrap}>
        <header
          className={`${css.section_header} ${css.payment_header}`}
        >
          <div className={`dimmed ${css.section_label}`}>
            <span className="relative">Payments</span>
          </div>
          <h1 className={css.section_heading}>Payment Methods</h1>
        </header>
        {enrolled ? null : (
          <AlertComponent type="error" style={{ margin: '0', padding: 8 }}>
            <div style={{ whiteSpace: 'pre-wrap', textAlign: 'center' }}>
              <div>You have NOT enrolled in any payment option!</div>
              <div>
                Clients will not be able to pay deposits even when you set them on your services.
              </div>
            </div>
          </AlertComponent>
        )}
      </div>
      <div className={css.payment_body}>
        <h2 className={css.payment_option_heading}>Available Payment Options</h2>
        <div className={css.payment_rows_panel}>
          {paymentMethods.map((name) => (
            <PaymentsMethodRow key={name} name={name} company={company} />
          ))}
        </div>
      </div>
    </section>
  );
};

PaymentsPanel.propTypes = {
  company: companyProps.isRequired,
};

const CityEditor = ({ company, countries }) => {
  const [country, setCountry] = useState(null);
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (company.city) {
      setCountry(countries.find((c) => c.id === company.city.state.country.id));
    }
  }, []);

  useEffect(() => setState(country ? country.states[0] : null), [country, setState]);

  useEffect(() => setCity(state ? state.cities[0] : null), [state, setCity]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === COUNTRY) {
      setCountry(countries.find((c) => c.id === Number.parseInt(value, 10)));
    } else if (name === STATE) {
      setState((country && country.states.find(
        (s) => s.id === Number.parseInt(value, 10),
      )) || null);
    } else if (name === CITY) {
      setCity((state && state.cities.find((c) => c.id === Number.parseInt(value, 10))) || null);
    }
  }, [countries, country, state]);

  const handleUpdate = useCallback(() => {
    if (!city) {
      return;
    }

    setBusy(true);
    dispatch(updateCompanyCityAsync(city, state, country, () => {
      setBusy(false);
    }));
  }, [city, state, country, setBusy]);

  return (
    <section className={css.city_editor_section}>
      <div className={css.city_editor}>
        <h1 className={css.city_editor_heading}>Update Your City</h1>
        <div className={css.city_editor_selects_wrap}>
          <div className={css.city_editor_select_wrap}>
            <label className={`select ${css.city_editor_select}`} htmlFor={COUNTRY}>
              <select
                id={COUNTRY}
                name={COUNTRY}
                value={(country && country.id) || ''}
                onChange={handleValueChange}
                title={country && country.name}
              >
                <option value="" disabled>Select Country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>{country.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className={css.city_editor_select_wrap}>
            <label className={`select ${css.city_editor_select}`} htmlFor={STATE}>
              <select
                id={STATE}
                name={STATE}
                value={(state && state.id) || ''}
                onChange={handleValueChange}
                title={state && state.name}
              >
                <option value="" disabled>Select State</option>
                {country ? country.states.map((state) => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                )) : null}
              </select>
            </label>
          </div>
          <div className={css.city_editor_select_wrap}>
            <label className={`select ${css.city_editor_select}`} htmlFor={CITY}>
              <select
                id={CITY}
                name={CITY}
                value={(city && city.id) || ''}
                onChange={handleValueChange}
                title={city && city.name}
              >
                <option value="" disabled>Select City</option>
                {state && state.cities ? state.cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                )) : null}
              </select>
            </label>
          </div>
        </div>
        <LoadingButton
          type="button"
          label="Update"
          loading={busy}
          onClick={handleUpdate}
          styles={{
            fontSize: 16,
            padding: 10,
            marginTop: 16,
          }}
        />
      </div>
    </section>
  );
};

CityEditor.propTypes = {
  company: companyProps.isRequired,
  countries: PropTypes.arrayOf(countryProps).isRequired,
};

const CityPanel = ({
  countries,
  company,
}) => {
  const [editorOpen, setEditorOpen] = useState(false);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE_CITY_EDITOR) {
      setEditorOpen(false);
    } else if (name === OPEN_CITY_EDITOR) {
      setEditorOpen(true);
    }
  }, []);

  return (
    <section className={`${css.card} ${css.city_section}`}>
      <div className={css.section_header_wrap}>
        <header
          className={`${css.section_header} ${css.city_header}`}
          style={{ height: company.city ? 180 : 80 }}
        >
          <div className={`dimmed ${css.section_label}`}>
            <span className="relative">City</span>
          </div>
          <h1 className={css.section_heading}>
            {company.city ? company.city.name : 'City NOT set!'}
          </h1>
        </header>
        {company.city ? null : (
          <AlertComponent type="error" style={{ margin: 0 }}>
            <span>
              Please set your city for maximum discoverability in searches!
            </span>
          </AlertComponent>
        )}
      </div>
      <div className={`${css.section_body} ${css.city_body}`}>
        {company.city ? (
          <div className={css.city_details_wrap}>
            <div className={css.city_details_row}>
              <span className={css.city_details_label}>Address</span>
              <span className={css.city_details_value}>{company.address}</span>
            </div>
            <div className={css.city_details_state_country_row}>
              <div className={css.city_details_row}>
                <span className={css.city_details_label}>State</span>
                <span className={css.city_details_value}>{company.city.state.name}</span>
              </div>
              <div className={css.city_details_row}>
                <span className={css.city_details_label}>Country</span>
                <span className={css.city_details_value}>{company.city.state.country.name}</span>
              </div>
            </div>
          </div>
        ) : (
          <CityEditor countries={countries} company={company} />
        )}
      </div>
      {company.city ? (
        <div className={`${css.section_editor_slider} ${editorOpen ? css.open : ''}`}>
          <div className={css.section_editor_slider_pad}>
            <CityEditor company={company} countries={countries} />
          </div>
        </div>
      ) : null}
      <div className={css.section_footer}>
        {company.city ? (
          <SvgButton
            type="button"
            name={editorOpen ? CLOSE_CITY_EDITOR : OPEN_CITY_EDITOR}
            color={editorOpen ? colors.delete : '#011C39'}
            path={editorOpen ? paths.close : paths.pencil}
            onClick={handleClick}
            sm
          />
        ) : null}
      </div>
    </section>
  );
};

CityPanel.propTypes = {
  company: companyProps.isRequired,
  countries: PropTypes.arrayOf(countryProps).isRequired,
};

const OpenHoursPanel = ({ company }) => {
  const [openDays, setOpenDays] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const busyDialog = useBusyDialog();
  const notification = useNotification();
  const dispatch = useDispatch();

  useEffect(() => {
    setOpenDays(company.openDays || []);
    if (company.officeHours) {
      setStart(dateUtils.toTimeFormat(company.officeHours.start));
      setEnd(dateUtils.toTimeFormat(company.officeHours.end));
    }
  }, []);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === OFFICE_CLOSE_TIME) {
      setEnd(value);
    } else if (name === OFFICE_START_TIME) {
      setStart(value);
    }
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === SAVE) {
      const data = {};
      if (start && end) {
        const startTime = dateUtils.fromTimeFormat(start);
        const endTime = dateUtils.fromTimeFormat(end);
        if (company.officeHours) {
          if (startTime !== company.officeHours.start) {
            data.working_hours_start = startTime;
          }
          if (endTime !== company.officeHours.end) {
            data.working_hours_end = endTime;
          }
        } else {
          data.working_hours_start = startTime;
          data.working_hours_end = endTime;
        }
      } else if (start || end) {
        notification.showError('Please set both the starting and closing time!');
        return;
      }

      if (openDays.length) {
        const days = [...openDays];
        days.sort();

        if (company.openDays) {
          if (days.length !== company.openDays.length) {
            data.open_days = days;
          } else {
            const old = [...company.openDays];
            old.sort();
            if (old.join('') !== days.join()) {
              data.open_days = days;
            }
          }
        } else {
          data.open_days = days;
        }
      }

      if (!Object.keys(data).length) {
        notification.showInfo('No Changes Detected!');
        return;
      }

      const popup = busyDialog.show('Updating your information ...');
      dispatch(updateCompanyAsync(data, () => {
        popup.close();
      }));
    }
  }, [company, start, end, openDays]);

  const handleCheckBtnClick = useCallback(({ target: { name } }) => {
    const idx = Number.parseInt(name, 10);
    setOpenDays((days) => (
      days.includes(idx) ? days.filter((i) => i !== idx) : [...days, idx]
    ));
  }, []);

  return (
    <section className={`${css.card} ${css.section} ${css.location_section}`}>
      <div className={css.section_header_wrap}>
        <header
          className={`${css.section_header} ${css.open_hours_header}`}
        >
          <div className={`dimmed ${css.section_label}`}>
            <span className="relative">Open Hours</span>
          </div>
          <h1 className={css.section_heading}>Open Days</h1>
        </header>
        {company.openDays ? null : (
          <AlertComponent type="error" style={{ margin: 0 }}>
            <span>We use your open days to exclude dates from auto generated time slots.</span>
          </AlertComponent>
        )}
      </div>
      <div className={css.section_body}>
        <div className={css.open_days_grid}>
          {weekdays.map((day, idx) => (
            <SimpleCheckBox
              key={day}
              label={day}
              id={day}
              name={idx}
              onChange={handleCheckBtnClick}
              checked={openDays.includes(idx)}
              labelStyle={{
                fontSize: '0.7rem',
              }}
            />
          ))}
        </div>
        <div className={css.open_hours_wrap}>
          <label className={css.open_time_wrap} htmlFor={OFFICE_START_TIME}>
            <span className={css.open_time_label}>Start Time</span>
            <input
              type="time"
              id={OFFICE_START_TIME}
              name={OFFICE_START_TIME}
              value={start}
              onChange={handleValueChange}
            />
          </label>
          <label className={css.open_time_wrap} htmlFor={OFFICE_CLOSE_TIME}>
            <span className={css.open_time_label}>Close Time</span>
            <input
              type="time"
              id={OFFICE_CLOSE_TIME}
              name={OFFICE_CLOSE_TIME}
              value={end}
              onChange={handleValueChange}
            />
          </label>
        </div>
      </div>
      <div className={css.section_footer}>
        {company.location ? (
          <SvgButton
            type="button"
            name={SAVE}
            path={paths.save}
            color="#228349"
            title="Save"
            onClick={handleClick}
            sm
          />
        ) : null}
      </div>
    </section>
  );
};

OpenHoursPanel.propTypes = {
  company: companyProps.isRequired,
};

const LocationEditor = () => {
  const [busy, setBusy] = useState(false);
  const [coords, setCoords] = useState({
    latitude: location.hasData ? location.latitude : '--',
    longitude: location.hasData ? location.longitude : '--',
    lastSaved: location.hasData ? getLastSaved(location.lastSaved) : '--',
  });
  const notification = useNotification();
  const dispatch = useDispatch();

  const reload = useCallback(() => (
    location.reload()
      .then((coords) => setCoords({ ...coords, lastSaved: getLastSaved(coords.lastSaved) }))
      .catch(({ message }) => notification.showError(message))
  ), []);

  useEffect(() => {
    if (!location.hasData) {
      reload();
    }
  }, []);

  const handleUpdate = useCallback(() => {
    if (!coords) {
      notification.showError(
        "Please click the reload button for the APP to read current! Ensure that 'Location' is enabled for this web page.",
      );
      return;
    }

    setBusy(true);
    dispatch(updateCompanyLocationAsync(coords.latitude, coords.longitude, () => {
      setBusy(false);
    }));
  }, [coords]);

  return (
    <section className={css.location_editor_section}>
      <div className={css.location_editor}>
        <h1 className={css.location_editor_heading}>Device Location</h1>
        <div className={css.location_details_wrap}>
          <div className={css.location_details_row}>
            <span className={css.location_details_label}>Latitude</span>
            <span>{coords.latitude}</span>
          </div>
          <div className={css.location_details_row}>
            <span className={css.location_details_label}>Longitude</span>
            <span>{coords.longitude}</span>
          </div>
          <div className={css.location_details_row}>
            <span className={css.location_details_label}>Last Saved</span>
            <span>{coords.lastSaved}</span>
          </div>
        </div>
        <div className={css.location_reload_link_wrap}>
          <button type="button" className="link compact-link" onClick={reload}>
            Click To Reload Your Location
          </button>
        </div>
        <LoadingButton
          type="button"
          label="Update"
          loading={busy}
          onClick={handleUpdate}
          styles={{
            fontSize: 16,
            padding: 10,
            marginTop: 16,
          }}
        />
      </div>
    </section>
  );
};

const LocationPanel = ({ company }) => {
  const [editorOpen, setEditorOpen] = useState(false);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === OPEN_LOCATION_EDITOR) {
      setEditorOpen(true);
    } else if (name === CLOSE_LOCATION_EDITOR) {
      setEditorOpen(false);
    }
  }, []);

  return (
    <section className={`${css.card} ${css.section} ${css.location_section}`}>
      <div className={css.section_header_wrap}>
        <header
          className={`${css.section_header} ${css.location_header}`}
        >
          <div className={`dimmed ${css.section_label}`}>
            <span className="relative">Location</span>
          </div>
          <h1 className={css.section_heading}>Location</h1>
        </header>
        {company.location ? null : (
          <AlertComponent type="error" style={{ margin: 0 }}>
            <span>Please set your location for maximum visibility.</span>
          </AlertComponent>
        )}
      </div>
      <div className={css.section_body}>
        {company.location ? (
          <div className={css.location_company_details}>
            <div className={css.location_details_wrap}>
              <div className={css.location_details_row}>
                <span className={css.location_details_label}>Latitude</span>
                <span>{company.location.latitude}</span>
              </div>
              <div className={css.location_details_row}>
                <span className={css.location_details_label}>Longitude</span>
                <span>{company.location.longitude}</span>
              </div>
            </div>
          </div>
        ) : (
          <LocationEditor />
        )}
      </div>
      {company.location ? (
        <div className={`${css.section_editor_slider} ${editorOpen ? css.open : ''}`}>
          <div className={css.section_editor_slider_pad}>
            <LocationEditor />
          </div>
        </div>
      ) : null}
      <div className={css.section_footer}>
        {company.location ? (
          <SvgButton
            type="button"
            name={editorOpen ? CLOSE_LOCATION_EDITOR : OPEN_LOCATION_EDITOR}
            color={editorOpen ? colors.delete : '#011C39'}
            path={editorOpen ? paths.close : paths.refresh}
            onClick={handleClick}
            sm
          />
        ) : null}
      </div>
    </section>
  );
};

LocationPanel.propTypes = {
  company: companyProps.isRequired,
};

const SubscriptionPanel = () => {
  const [nextPaymentDueDate, setNextPaymentDueDate] = useState('--');
  const subscription = useSelector(selectSubscription);

  useEffect(() => {
    if (subscription.dueOn) {
      setNextPaymentDueDate(new Date(subscription.dueOn).toLocaleDateString());
    }
  }, [subscription, setNextPaymentDueDate]);

  if (!subscription) {
    return <></>;
  }

  return (
    <section className={`${css.card} ${css.section} ${css.subscription_section}`}>
      <header className={css.subscription_header}>
        <div className={`${css.section_label} ${css.location_label}`}>
          <span className="relative">Subscription</span>
        </div>
        <h1 className={css.subscription_heading}>
          {subscription.name}
        </h1>
        <div className={`${css.subscription_status} ${css[subscription.status]}`}>
          {subscription.status}
        </div>
      </header>
      <div className={css.subscription_body}>
        <div className={css.subscription_plan_wrap}>
          <div className={css.subscription_plan}>
            <span className={css.subscription_price_label}>
              Plan Price
            </span>
            <span className={css.subscription_price}>
              {currencyHelper.fromDecimal(
                subscription.price.amount,
                subscription.price.country.currencySymbol,
              )}
            </span>
          </div>
          <Link
            to={routes.company.absolute.subscriptions}
            className={css.subscription_plan_btn}
          >
            <span className={css.subscription_plan_btn_change}>Change</span>
            <span>Plan</span>
          </Link>
        </div>
        <div className={css.subscription_next_payment_wrap}>
          <span className={css.subscription_next_payment_label}>
            Next Payment Date
          </span>
          <span>
            {nextPaymentDueDate}
          </span>
        </div>
      </div>
      <footer className={css.subscription_footer}>
        <Link
          to={routes.company.absolute.subscriptionRenewal}
          className={css.subscription_payment_btn}
        >
          Make Payments
        </Link>
      </footer>
    </section>
  );
};

const ProfilePicturePanel = ({ company }) => {
  const busyDialog = useBusyDialog();
  const dispatch = useDispatch();

  const validateImage = useCallback((file, callback) => {
    isImage(file)
      .then((isImage) => callback(isImage ? undefined : 'File type NOT supported!'))
      .catch(() => callback('File type NOT supported!'));
  }, []);

  const handleSubmit = useCallback((file, callback) => {
    const popup = busyDialog.show('Uploading profile picture ...');
    uploadFile('chassnet', 'image', 'logaxp', file)
      .then(({ secure_url: url }) => dispatch(updateCompanyImages(
        url, 'profile', 'profilePicture', (err) => {
          popup.close();
          if (err) {
            callback(
              err.length < 200
                ? err
                : 'An error occurred while uploading image!. Please try again.',
            );
          } else {
            callback();
          }
        },
      )))
      .catch(() => {
        popup.close();
        callback('An error occurred while uploading image!. Please try again.');
      });
  }, []);

  return (
    <section className={`${css.card} ${css.section} ${css.upload_section}`}>
      {company.profilePicture ? null : (
        <AlertComponent type="error" style={{ margin: '0', padding: 8 }}>
          <div>
            <div>You have NOT uploaded your profile picture!</div>
            <div>A generic image is displayed on your page.</div>
          </div>
        </AlertComponent>
      )}
      <div className={`relative ${css.section_body}`}>
        <ImageUploader
          onValidate={validateImage}
          onSubmit={handleSubmit}
          previewPlaceholder={company?.profilePicture}
          buttonText="Upload Profile Picture"
          openDialogPrompt={company.profilePicture ? 'Choose another picture to change' : null}
          aspectRatio={1.5}
        />
        <div className={`dimmed ${css.section_label}`}>
          <span className="relative">Profile Picture</span>
        </div>
      </div>
    </section>
  );
};

ProfilePicturePanel.propTypes = {
  company: companyProps.isRequired,
};

const CoverImagePanel = ({ company }) => {
  const busyDialog = useBusyDialog();
  const dispatch = useDispatch();

  const validateImage = useCallback((file, callback) => {
    isImage(file)
      .then((isImage) => callback(isImage ? undefined : 'File type NOT supported!'))
      .catch(() => callback('File type NOT supported!'));
  }, []);

  const handleSubmit = useCallback((file, callback) => {
    const popup = busyDialog.show('Uploading profile picture ...');
    uploadFile('chassnet', 'image', 'logaxp', file)
      .then(({ secure_url: url }) => dispatch(updateCompanyImages(
        url, 'cover', 'coverImage', (err) => {
          popup.close();
          if (err) {
            callback(
              err.length < 200
                ? err
                : 'An error occurred while uploading image!. Please try again.',
            );
          } else {
            callback();
          }
        },
      )))
      .catch(() => {
        popup.close();
        callback('An error occurred while uploading image!. Please try again.');
      });
  }, []);

  return (
    <section className={`${css.card} ${css.section} ${css.upload_section}`}>
      {company.coverImage ? null : (
        <AlertComponent type="error" style={{ margin: '0', padding: 8 }}>
          <div>
            <div>Please uploaded your cover image!</div>
            <div>They give your page a better look and feel.</div>
          </div>
        </AlertComponent>
      )}
      <div className={`relative ${css.section_body}`}>
        <ImageUploader
          onValidate={validateImage}
          onSubmit={handleSubmit}
          previewPlaceholder={company?.coverImage || defaultImages.cover}
          buttonText="Upload Cover Image"
          aspectRatio={1.5}
        />
        <div className={`dimmed ${css.section_label}`}>
          <span className="relative">Cover Image</span>
        </div>
      </div>
    </section>
  );
};

CoverImagePanel.propTypes = {
  company: companyProps.isRequired,
};

const Setup = () => {
  const countries = useSelector(selectCountries);
  const [company] = useOutletContext();
  const busyDialog = useBusyDialog();
  const dispatch = useDispatch();

  const loadCountries = useCallback(() => {
    const popup = busyDialog.show('Loading Countries ...');
    dispatch(loadCountriesAsync(popup.close));
  }, []);

  useEffect(() => {
    if (!countries) {
      loadCountries();
    }
  }, []);

  return (
    <main className={css.main}>
      <header className={css.page_header}>
        <h1 className={css.page_heading}>
          Company Setup
        </h1>
      </header>
      <div className={css.content}>
        {countries ? (
          <div className={css.setup_container}>
            <GridPanel minimumChildWidth={230}>
              <div className={css.section_wrap}>
                <PaymentsPanel company={company} />
              </div>
              <div className={css.section_wrap}>
                <CityPanel company={company} countries={countries} />
              </div>
              <div className={css.section_wrap}>
                <LocationPanel company={company} countries={countries} />
              </div>
              <div className={css.section_wrap}>
                <OpenHoursPanel company={company} countries={countries} />
              </div>
              <div className={css.section_wrap}>
                <SubscriptionPanel />
              </div>
              <div className={css.section_wrap}>
                <ProfilePicturePanel company={company} />
              </div>
              <div className={css.section_wrap}>
                <CoverImagePanel company={company} />
              </div>
            </GridPanel>
          </div>
        ) : (
          <ResourceLoader resourceName="Countries" onReload={loadCountries} />
        )}
      </div>
    </main>
  );
};

export default Setup;
