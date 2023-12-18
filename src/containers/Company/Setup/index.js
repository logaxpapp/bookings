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
import {
  currencyHelper,
  dateUtils,
  notification,
} from '../../../utils';
import { isImage, uploadFile } from '../../../lib/CloudinaryUtils';
import ImageUploader from '../../../components/ImageUploader';
import defaultImages from '../../../utils/defaultImages';
import { AccentRadioButton, Switch } from '../../../components/Inputs';
import GridPanel from '../../../components/GridPanel';
import routes from '../../../routing/routes';
import payments from '../../../payments';
import { useDialog } from '../../../lib/Dialog';
import TextBox, { isNumber } from '../../../components/TextBox';
import { getUserLocation, loadIPLocationAsync } from '../../../redux/userLocationSlice';
import { updateResource } from '../../../api';

const location = UserLocation.getLocation();

/**
 *
 * @param {Date} date
 * @returns
 */
const getLastSaved = (date) => `${date.toLocaleDateString()}T${date.toLocaleTimeString()}`;

const CANCEL = 'cancel';
const CITY = 'city';
const CLOSE_CITY_EDITOR = 'close_city_editor';
const CLOSE_LOCATION_EDITOR = 'close_location_editor';
const CONFIRM_LOCATION = 'confirm_location';
const COUNTRY = 'country';
const LATITUDE = 'latitude';
const LONGITUDE = 'longitude';
const MODE = 'mode';
const OFFICE_CLOSE_TIME = 'office_close_time';
const OFFICE_START_TIME = 'office_start_time';
const OPEN_CITY_EDITOR = 'open_city_editor';
const OPEN_LOCATION_EDITOR = 'open_location_editor';
const SAVE = 'save';
const SETUP_PAYMENT = 'setup_payment';
const STATE = 'state';

const locationModes = {
  device: 'device',
  network: 'network',
  manual: 'manual',
};

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

const paymentMethods = ['stripe', 'paystack'];

const PaymentsMethodRow = ({ name, company }) => {
  const [busy, setBusy] = useState(false);
  const token = useSelector(selectToken);
  const [method, setMethod] = useState(null);
  const busyDialog = useBusyDialog();
  const dispatch = useDispatch();

  useEffect(() => {
    setMethod(company.paymentMethods.find((m) => m.name === name));
  }, [name, company]);

  const handleSetupPaymentMethod = useCallback(() => {
    const handler = payments.getHandler(name);
    if (!handler) {
      return;
    }
    setBusy(true);
    handler.setupPaymentMethod(token, (update) => {
      setBusy(false);
      if (update) {
        const paymentMethods = company.paymentMethods.map((m) => (
          m.name === name ? { ...m, isEnabled: true } : m
        ));
        dispatch(setCompany({ ...company, paymentMethods }));
      }
    });
  }, [company, name]);

  const handleValueChange = useCallback(({ target }) => {
    const { name } = target;
    const status = target.checked ? 'active' : 'inactive';

    let path;
    switch (name) {
      case 'stripe':
        path = 'stripe_connected_accounts/update';
        break;
      case 'paystack':
        path = 'paystack_connected_accounts';
        break;
      default:
        break;
    }

    if (!path) {
      notification.showError('Application error! Please try again.');
      return;
    }

    const popup = busyDialog.show('Updating status ...');

    updateResource(token, path, { status }, true)
      .then(() => {
        const paymentMethods = company.paymentMethods.map((m) => (
          m.name === name ? { ...m, isEnabled: status === 'active' } : m
        ));
        dispatch(setCompany({ ...company, paymentMethods }));
        popup.close();
      })
      .catch(() => {
        notification.showError('Failed to update status!');
        popup.close();
      });
  }, [company, busyDialog]);

  return (
    <div className={css.payment_row}>
      <span className={`${css.payment_row_label} ${method ? css.enrolled : ''}`}>
        {name}
      </span>
      {method ? (
        <Switch
          name={name}
          value={name}
          checked={method.isEnabled}
          onChange={handleValueChange}
        />
      ) : (
        <>
          {busy ? (
            <Ring color="#1276f3" size={14} />
          ) : (
            <button
              type="button"
              name={SETUP_PAYMENT}
              className="link compact-link"
              onClick={handleSetupPaymentMethod}
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
    setEnrolled(!!company.paymentMethods.find(({ isEnabled }) => isEnabled));
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
        <div className={css.payments_rows_panel}>
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

  const handleStateChange = useCallback((state) => {
    setState(state);
    if (state) {
      setCity(state.cities[0]);
    }
  }, []);

  useEffect(() => {
    const c = countries.find(({ id }) => id === company.country.id);
    setCountry(c);
    if (c && company.city) {
      const state = c.states.find(({ id }) => id === company.city.stateId);
      setState(state);
      if (state) {
        setCity(state.cities.find(({ id }) => id === company.city.id));
      }
    }
  }, []);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === COUNTRY) {
      const country = countries.find((c) => c.id === Number.parseInt(value, 10));
      setCountry(country);
      if (country) {
        handleStateChange(country.states[0]);
      }
    } else if (name === STATE) {
      const state = country && country.states.find(({ id }) => id === Number.parseInt(value, 10));
      handleStateChange(state);
    } else if (name === CITY) {
      setCity(state && state.cities.find(({ id }) => id === Number.parseInt(value, 10)));
    }
  }, [countries, country, state, handleStateChange]);

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
                <option value={company.country.id}>
                  {company.country.name}
                </option>
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
              <span className={`${css.city_details_value} ${css.address}`}>{company.address}</span>
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
      if (start && dateUtils.fromTimeFormat(start) >= dateUtils.fromTimeFormat(value)) {
        notification.showError('End Time MUST be greater than Start Time!');
        return;
      }
      setEnd(value);
    } else if (name === OFFICE_START_TIME) {
      if (end && dateUtils.fromTimeFormat(value) >= dateUtils.fromTimeFormat(end)) {
        notification.showError('End Time MUST be greater than Start Time!');
        return;
      }
      setStart(value);
    }
  }, [start, end]);

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
      <div className={`${css.section_header_wrap} ${css.open_hours_header_wrap}`}>
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
      <div className={`${css.section_body} ${css.open_hours_body}`}>
        <fieldset className={css.open_days_set}>
          <legend>Business Open Days</legend>
          <div className={css.open_days_grid}>
            {weekdays.map((day, idx) => (
              <label className={css.open_day_label} key={day} htmlFor={day}>
                <input
                  type="checkbox"
                  id={day}
                  name={idx}
                  onChange={handleCheckBtnClick}
                  checked={openDays.includes(idx)}
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className={css.open_days_set}>
          <legend>Business Open Hours</legend>
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
        </fieldset>
      </div>
      <div className={css.section_footer}>
        <SvgButton
          type="button"
          name={SAVE}
          path={paths.save}
          color="#228349"
          title="Save"
          onClick={handleClick}
          sm
        />
      </div>
    </section>
  );
};

OpenHoursPanel.propTypes = {
  company: companyProps.isRequired,
};

export const LocationEditor1 = () => {
  const [busy, setBusy] = useState(false);
  const [coords, setCoords] = useState({
    latitude: location.hasData ? location.latitude : '--',
    longitude: location.hasData ? location.longitude : '--',
    lastSaved: location.hasData ? getLastSaved(location.lastSaved) : '--',
  });
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

const LocationEditor = ({ onClose }) => {
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState(locationModes.device);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [data, setData] = useState({
    latitude: '',
    longitude: '',
    confirmMessage: '',
  });
  const dispatch = useDispatch();

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === MODE) {
      setMode(value);
    } else if (name === LATITUDE) {
      if (value === '' || isNumber(value)) {
        setLatitude(value);
      }
    } else if (name === LONGITUDE) {
      if (value === '' || isNumber(value)) {
        setLongitude(value);
      }
    }
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === SAVE) {
      if (mode === locationModes.device) {
        setBusy(true);
        getUserLocation()
          .then((location) => {
            const confirmMessage = `Your Device Location\n\nLatitude: ${location.latitude}.\nLongitude: ${location.longitude}\n\nClick confirm to update.`;
            setData({ ...location, confirmMessage });
            setBusy(false);
          })
          .catch(() => {
            notification.showError(
              'Error determining your location. Please ensure that location is enabled for this page, then try again!',
            );
            setBusy(false);
          });
      } else if (mode === locationModes.network) {
        setBusy(true);
        dispatch(loadIPLocationAsync((err, location) => {
          if (!err) {
            const confirmMessage = `Your Network Determined Location\n\nLatitude: ${location.latitude}\nLongitude: ${location.longitude}\nCity: ${location.city}\nState: ${location.region}\nCountry: ${location.country}\n\nClick confirm to update.`;
            setData({ ...location, confirmMessage });
          } else {
            notification.showError(
              'Error determining your location. Please try again!',
            );
          }
          setBusy(false);
        }));
      } else if (mode === locationModes.manual) {
        if (!(latitude && longitude)) {
          notification.showError('Please enter both latitude and longitude!');
          return;
        }

        setData({
          latitude,
          longitude,
          confirmMessage: `Manually Entered Location\n\nLatitude: ${latitude}\nLongitude: ${longitude}\n\nClick confirm to update.`,
        });
      }
    } else if (name === CANCEL) {
      setData((data) => ({ ...data, confirmMessage: '' }));
    } else if (name === CONFIRM_LOCATION) {
      setBusy(true);
      setData((data) => ({ ...data, confirmMessage: '' }));
      dispatch(updateCompanyLocationAsync(data.latitude, data.longitude, (err) => {
        setBusy(false);

        if (!err) {
          onClose();
        }
      }));
    }
  }, [data, mode, latitude, longitude, onClose]);

  return (
    <div className="dialog">
      <section className="bold-dialog-body">
        <h1 className={css.location_dialog_heading}>
          Please select a method below to update your location.
        </h1>
        <AccentRadioButton
          name={MODE}
          value={locationModes.device}
          radioSize={28}
          checked={mode === locationModes.device}
          label="Device Location. (Please allow Location Access if prompted)"
          onChange={handleValueChange}
          style={{
            fontSize: '1.05rem',
            cursor: 'pointer',
          }}
        />
        <AccentRadioButton
          name={MODE}
          value={locationModes.network}
          radioSize={28}
          checked={mode === locationModes.network}
          label="Server Provided Location"
          onChange={handleValueChange}
          style={{
            fontSize: '1.05rem',
            cursor: 'pointer',
          }}
        />
        <AccentRadioButton
          name={MODE}
          value={locationModes.manual}
          radioSize={28}
          checked={mode === locationModes.manual}
          label="Manual Input. (Please use ONLY if you know what you are doing)"
          onChange={handleValueChange}
          style={{
            fontSize: '1.05rem',
            cursor: 'pointer',
          }}
        />
        <div
          className={`${css.location_dialog_manual_inputs} ${mode === locationModes.manual ? css.open : ''}`}
        >
          <TextBox
            type="text"
            name={LATITUDE}
            id={LATITUDE}
            value={latitude}
            label="Latitude"
            style={{
              border: '1px solid #ccc',
              borderRadius: 4,
            }}
            onChange={handleValueChange}
            hideErrorOnNull
          />
          <TextBox
            type="text"
            name={LONGITUDE}
            id={LONGITUDE}
            value={longitude}
            label="Longitude"
            style={{
              border: '1px solid #ccc',
              borderRadius: 4,
            }}
            onChange={handleValueChange}
            hideErrorOnNull
          />
        </div>
        <LoadingButton
          type="button"
          name={SAVE}
          loading={busy}
          label="Update Location"
          onClick={handleClick}
          styles={{
            fontSize: 14,
            marginTop: 0,
          }}
        />
        <SvgButton
          title="Close"
          color={colors.delete}
          path={paths.close}
          onClick={onClose}
          style={{
            position: 'absolute',
            right: 4,
            top: 4,
          }}
        />
        {data.confirmMessage ? (
          <div className={css.location_confirmation_wrap}>
            <pre className={css.location_confirmation_text}>{data.confirmMessage}</pre>
            <div className={css.location_confirmation_controls}>
              <button
                type="button"
                name={CONFIRM_LOCATION}
                className="control-btn bold"
                onClick={handleClick}
              >
                Confirm
              </button>
              <button
                type="button"
                name={CANCEL}
                className="control-btn bold cancel"
                onClick={handleClick}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
};

LocationEditor.propTypes = {
  onClose: PropTypes.func.isRequired,
};

const LocationPanel = ({ company }) => {
  const [editorOpen, setEditorOpen] = useState(false);
  const dialog = useDialog();

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === OPEN_LOCATION_EDITOR) {
      let popup;
      const handleClose = () => popup.close();
      popup = dialog.show(
        <LocationEditor onClose={handleClose} />,
      );
    } else if (name === CLOSE_LOCATION_EDITOR) {
      setEditorOpen(false);
    }
  }, [dialog]);

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
          <AlertComponent type="error" style={{ margin: 0 }}>
            <span>Please set your location for maximum visibility.</span>
          </AlertComponent>
        )}
      </div>
      <div className={css.section_footer}>
        <SvgButton
          type="button"
          name={editorOpen ? CLOSE_LOCATION_EDITOR : OPEN_LOCATION_EDITOR}
          color={editorOpen ? colors.delete : '#011C39'}
          path={editorOpen ? paths.close : paths.refresh}
          onClick={handleClick}
          sm
        />
      </div>
    </section>
  );
};

LocationPanel.propTypes = {
  company: companyProps.isRequired,
};

const SubscriptionPanel = () => {
  const subscription = useSelector(selectSubscription);
  const [params, setParams] = useState({
    nextPaymentDueDate: '--',
    amount: '--',
  });

  useEffect(() => {
    if (subscription) {
      setParams({
        nextPaymentDueDate: new Date(subscription.dueOn).toLocaleString(),
        amount: currencyHelper.toString(
          subscription.price.amount,
          subscription.price.country.currencySymbol,
        ),
      });
    }
  }, [subscription, setParams]);

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
              {params.amount}
            </span>
          </div>
          <Link
            to={routes.company.absolute.subscriptionChange}
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
            {params.nextPaymentDueDate}
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
    uploadFile('logaxp', 'image', 'appointments', file)
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
            <div>
              This generic image is displayed on your profile page. Upload your profile
              picture to give your page a personal touch and an appealing look.
            </div>
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
    const popup = busyDialog.show('Uploading cover image ...');
    uploadFile('logaxp', 'image', 'appointments', file)
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
            <div>Please upload your cover image!</div>
            <div>
              A good cover image gives your page a personal feel
              and makes it more appealing to potential clients.
            </div>
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
            <GridPanel minimumChildWidth={280} maxColumns={4}>
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
                <PaymentsPanel company={company} />
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
