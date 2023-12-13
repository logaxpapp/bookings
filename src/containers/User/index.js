import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import css from './style.module.css';
import {
  closeAppointmentMessage,
  loadAppointmentsAsync,
  openAppointmentMessages,
  selectAppointments,
  selectOpenMessages,
  selectUser,
  sendAppointmentMessageAsync,
  setMaxOpenMessages,
  updatePasswordAsync,
  updateUserAsync,
  updateUserCityAsync,
} from '../../redux/userSlice';
import routes from '../../routing/routes';
import { dateUtils, notification, TIMEZONE } from '../../utils';
import Header from '../Header';
import UserLocation from '../../utils/userLocation';
import { SvgButton, colors, paths } from '../../components/svg';
import { appointmentProps, userProps } from '../../utils/propTypes';
import {
  loadCountriesAsync,
  selectCountries,
} from '../../redux/countriesSlice';
import LoadingButton from '../../components/LoadingButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertComponent from '../../components/AlertComponents';
import { AccentRadioButton } from '../../components/Inputs';
import TextBox, { FieldEditor, isNumber } from '../../components/TextBox';
import { useDialog } from '../../lib/Dialog';
import {
  deleteBookmarkedCompany,
  selectBookmarkedCompanies,
  selectSearchParams,
  setSearchParams,
} from '../../redux/userPreferences';
import { searchParamsOptions } from '../../utils/userPreferences';
import { DateButton } from '../../components/Buttons';
import { useWindowSize } from '../../lib/hooks';
import MessagePanel from '../../components/MessagePanel';
import AppointmentsPanel from './AppointmentsPanel';
import PasswordEditor from '../PasswordEditor';
import WebSocketManager from './WebSockManager';
import { getUserLocation, loadIPLocationAsync } from '../../redux/userLocationSlice';

const APPOINTMENTS = 'appointments';
const BOOKMARKS = 'Bookmarks';
const CANCEL = 'cancel';
const CITY = 'city';
const CONFIRM_LOCATION = 'confirm_location';
const COUNTRY = 'country';
const LATITUDE = 'latitude';
const LONGITUDE = 'longitude';
const MODE = 'mode';
const OPEN_CITY_DIALOG = 'open_city_dialog';
const OPEN_PASSWORD_EDITOR = 'open_password_editor';
const REFRESH_LOCATION = 'refresh_location';
const SAVE = 'save';
const SEARCH_TERM = 'search_term';
const SETTINGS = 'Settings';
const STATE = 'state';
const UPDATE_CITY = 'update_city';

const locationModes = {
  device: 'device',
  network: 'network',
  manual: 'manual',
};

const tabs = [
  {
    title: SETTINGS,
    svgPath: paths.cog,
  },
  {
    title: BOOKMARKS,
    svgPath: paths.bookmark,
  },
  {
    title: APPOINTMENTS,
    svgPath: paths.calendarClock,
  },
];

/**
 * @param {Object} props
 * @param {import('../../types').Appointment} props.appointment
 * @returns
 */
const UserMessagePanel = ({ appointment, onClose }) => {
  const [title, setTitle] = useState('');
  const [rider, setRider] = useState('');
  const [messages, setMessages] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    setTitle(appointment.timeSlot.service.company.name);
    setRider(`Service: ${appointment.timeSlot.service.name}`);
    setMessages(appointment.messages.map((msg) => ({
      id: msg.id,
      senderName: msg.senderType,
      content: msg.content,
    })));
  }, [appointment]);

  const handleSubmit = useCallback((content) => dispatch(sendAppointmentMessageAsync(
    appointment,
    { content },
  )), [appointment]);

  const handleClose = useCallback(() => {
    onClose(appointment);
  }, [appointment]);

  return (
    <MessagePanel
      messages={messages}
      title={title}
      rider={rider}
      username="User"
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  );
};

UserMessagePanel.propTypes = {
  appointment: appointmentProps.isRequired,
  onClose: PropTypes.func.isRequired,
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
      setData((data) => ({ ...data, confirmMessage: '' }));
      const { longitude, latitude } = data;
      UserLocation.getLocation().save(latitude, longitude);
      onClose(latitude, longitude);
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

const Location = ({ onChange }) => {
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const dialog = useDialog();

  useEffect(() => {
    const userLocation = UserLocation.getLocation();
    if (userLocation.isAvailable) {
      setLocation({
        longitude: userLocation.longitude,
        latitude: userLocation.latitude,
      });
    }
  }, []);

  useEffect(() => {
    if (location.latitude !== '' && onChange) {
      onChange(location);
    }
  }, [location, onChange]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === REFRESH_LOCATION) {
      let popup;
      const handleClose = (latitude = null, longitude = null) => {
        const type = typeof latitude;
        if (type === 'number' || type === 'string') {
          setLocation({ latitude, longitude });
        }
        popup.close();
      };

      popup = dialog.show(<LocationEditor onClose={handleClose} />);
    }
  }, [dialog]);

  return (
    <section className={css.settings_section}>
      <header className={css.settings_header}>
        <h1 className={css.settings_heading}>
          Home Location
        </h1>
        <div className={css.controls}>
          <div className={css.preferred_location_explanation}>
            <span>?</span>
            <div className={`${css.context_menu} ${css.preferred_location_explanation_text}`}>
              This is a location used to filter search results even when you are not at home.
              You can override this by setting your preferences to
              &apos;Use My Current Location&apos;.
              This information is stored on your device.
            </div>
          </div>
          <SvgButton
            type="button"
            name={REFRESH_LOCATION}
            title="Refresh"
            path={paths.refresh}
            onClick={handleClick}
            sm
          />
        </div>
      </header>
      <div className={css.settings_body}>
        {location.latitude === '' ? (
          <span>
            You have NOT set your preffered location on this device.
          </span>
        ) : (
          <div className={css.location_wrap}>
            <div className={css.row}>
              <span className={css.label}>
                Latitude:
              </span>
              <span>{location.latitude}</span>
            </div>
            <div className={css.row}>
              <span className={css.label}>
                Longitude:
              </span>
              <span>{location.longitude}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

Location.propTypes = {
  onChange: PropTypes.func,
};

Location.defaultProps = {
  onChange: null,
};

const CityEditor = ({ user, onClose }) => {
  const [country, setCountry] = useState(null);
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const countries = useSelector(selectCountries);
  const dispatch = useDispatch();

  const reload = useCallback(() => {
    setLoading(true);
    dispatch(loadCountriesAsync((err) => {
      setLoadError(!!err);
      setLoading(false);
    }));
  }, []);

  const updateState = useCallback((state) => {
    setState(state);
    setCity(state ? state.cities[0] : null);
  }, []);

  useEffect(() => {
    if (!countries) {
      reload();
    }
  }, []);

  useEffect(() => {
    if (user.city && countries) {
      const country = countries.find((c) => c.id === user.city.state.country.id);
      setCountry(country);
      if (country) {
        const state = country.states.find(({ id }) => id === user.city.state.id);
        setState(state);
        if (state) {
          setCity(state.cities.find(({ id }) => id === user.city.id));
        }
      }
    }
  }, [user, countries]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === COUNTRY) {
      const country = countries.find((c) => c.id === Number.parseInt(value, 10));
      setCountry(country);
      if (country) {
        updateState(country.states[0]);
      }
    } else if (name === STATE) {
      updateState((country && country.states.find(
        (s) => s.id === Number.parseInt(value, 10),
      )));
    } else if (name === CITY) {
      setCity((state && state.cities.find((c) => c.id === Number.parseInt(value, 10))) || null);
    }
  }, [countries, country, state]);

  const handleUpdate = useCallback(() => {
    if (!city) {
      notification.showError('Please select a city');
      return;
    }

    setBusy(true);
    dispatch(updateUserCityAsync(city, state, country, () => {
      setBusy(false);
      onClose();
    }));
  }, [city, state, country, onClose]);

  /* eslint-disable no-nested-ternary */

  return (
    <div role="dialog" className="modal">
      <section className="modal-bold-body">
        {!countries ? null : loading ? (
          <LoadingSpinner>
            <span>Loading ...</span>
          </LoadingSpinner>
        ) : loadError ? (
          <div style={{ display: 'flex', gap: 8, textAlign: 'center' }}>
            <span>Application encountered an error while loading Countries. Please Click</span>
            <button type="button" className="link" onClick={reload}>here</button>
            <span>to reload</span>
          </div>
        ) : (
          <>
            <label htmlFor={COUNTRY} className="bold-select-wrap">
              <span className="label">Select Country</span>
              <div className="bold-select">
                <select
                  name={COUNTRY}
                  value={(country && country.id) || ''}
                  className={css.select}
                  onChange={handleValueChange}
                >
                  <option value="" disabled>-- Select Country --</option>
                  {countries ? countries.map((country) => (
                    <option value={country.id} key={country.id}>{country.name}</option>
                  )) : null}
                </select>
              </div>
            </label>
            <label htmlFor={STATE} className="bold-select-wrap">
              <span className="label">Select State</span>
              <div className="bold-select">
                <select
                  name={STATE}
                  value={(state && state.id) || ''}
                  onChange={handleValueChange}
                >
                  <option value="" disabled>-- Select State --</option>
                  {country ? country.states.map((state) => (
                    <option value={state.id} key={state.id}>{state.name}</option>
                  )) : null}
                </select>
              </div>
            </label>
            <label htmlFor={CITY} className="bold-select-wrap">
              <span className="label">Select City</span>
              <div className="bold-select">
                <select
                  name={CITY}
                  value={(city && city.id) || ''}
                  onChange={handleValueChange}
                >
                  <option value="" disabled>-- Select City --</option>
                  {state ? state.cities.map((city) => (
                    <option value={city.id} key={city.id}>{city.name}</option>
                  )) : null}
                </select>
              </div>
            </label>
            <LoadingButton
              type="button"
              name={UPDATE_CITY}
              label="Update City"
              loading={busy}
              onClick={handleUpdate}
              styles={{
                fontSize: '1rem',
              }}
            />
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
      </section>
    </div>
  );

  /* eslint-disable no-nested-ternary */
};

CityEditor.propTypes = {
  user: userProps.isRequired,
  onClose: PropTypes.string.isRequired,
};

const City = ({ user }) => {
  const dialog = useDialog();

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === OPEN_CITY_DIALOG) {
      let popup;
      const handleClose = () => popup.close();
      popup = dialog.show(<CityEditor user={user} onClose={handleClose} />);
    }
  }, [user, dialog]);

  return (
    <section className={css.settings_section}>
      <header className={css.settings_header}>
        <h1 className={css.settings_heading}>
          My City
        </h1>
        <SvgButton
          type="button"
          name={OPEN_CITY_DIALOG}
          title="Edit"
          path={paths.pencil}
          onClick={handleClick}
          sm
        />
      </header>
      <div className={css.settings_body}>
        <div
          className={`${css.city_wrap} ${user.city ? '' : css.empty}`}
        >
          {user.city ? (
            <>
              <div className={css.row}>
                <span className={css.label}>Country: </span>
                <span>{user.city.state.country.name}</span>
              </div>
              <div className={css.row}>
                <span className={css.label}>State: </span>
                <span>{user.city.state.name}</span>
              </div>
              <div className={css.row}>
                <span className={css.label}>City: </span>
                <span>{user.city.name}</span>
              </div>
            </>
          ) : null}
          {user.city ? null : (
            <AlertComponent
              type="error"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  textAlign: 'center',
                  display: 'block',
                  width: '100%',
                }}
              >
                You have NOT set your City!
              </span>
            </AlertComponent>
          )}
        </div>
      </div>
    </section>
  );
};

City.propTypes = {
  user: userProps.isRequired,
};

const Preferences = ({ user }) => {
  const savedSearhParams = useSelector(selectSearchParams);
  const [searchParam, setSearchParam] = useState();
  const [hasPreferredLocation, setHasPreferredLocation] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const hasPreferredLocation = UserLocation.getLocation().hasData;
    if (hasPreferredLocation && savedSearhParams === searchParamsOptions.HOME_LOCATION) {
      setSearchParam(searchParamsOptions.HOME_LOCATION);
    } else if (savedSearhParams === searchParamsOptions.User_CITY && user.city) {
      setSearchParam(searchParamsOptions.User_CITY);
    } else {
      setSearchParam(searchParamsOptions.DEVICE_LOCATION);
    }
    setHasPreferredLocation(hasPreferredLocation);
  }, [savedSearhParams]);

  const handleRadioCheck = useCallback(({ target }) => {
    if (!target.checked) {
      return;
    }

    const { name } = target;

    dispatch(setSearchParams(name));
  }, []);

  return (
    <section className={css.settings_section}>
      <header className={css.settings_header}>
        <h1 className={css.settings_heading}>Search Preferences</h1>
      </header>
      <div className={css.settings_body}>
        <div className={css.stack_panel}>
          <AccentRadioButton
            id={searchParamsOptions.HOME_LOCATION}
            name={searchParamsOptions.HOME_LOCATION}
            disabled={!hasPreferredLocation}
            checked={searchParam === searchParamsOptions.HOME_LOCATION}
            label="Use My Home Location"
            onChange={handleRadioCheck}
            labelStyle={{ fontSize: '0.8rem' }}
          />
          <AccentRadioButton
            id={searchParamsOptions.DEVICE_LOCATION}
            name={searchParamsOptions.DEVICE_LOCATION}
            checked={searchParam === searchParamsOptions.DEVICE_LOCATION}
            label="Use My Device Location"
            onChange={handleRadioCheck}
            labelStyle={{ fontSize: '0.8rem' }}
          />
          <AccentRadioButton
            id={searchParamsOptions.NETWORK_LOCATION}
            name={searchParamsOptions.NETWORK_LOCATION}
            checked={searchParam === searchParamsOptions.NETWORK_LOCATION}
            label="Use Network Provided Location"
            onChange={handleRadioCheck}
            labelStyle={{ fontSize: '0.8rem' }}
          />
          <AccentRadioButton
            id={searchParamsOptions.User_CITY}
            name={searchParamsOptions.User_CITY}
            disabled={!user.city}
            checked={searchParam === searchParamsOptions.User_CITY}
            label="Use My Saved City"
            onChange={handleRadioCheck}
            labelStyle={{ fontSize: '0.8rem' }}
          />
        </div>
      </div>
    </section>
  );
};

Preferences.propTypes = {
  user: userProps.isRequired,
};

const Details = ({ user }) => {
  const dispatch = useDispatch();
  const dialog = useDialog();

  const handleUpdate = useCallback((name, value, callback) => dispatch(
    updateUserAsync({ [name]: value }, callback),
  ), []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === OPEN_PASSWORD_EDITOR) {
      let popup;
      const handleClose = () => popup.close();
      popup = dialog.show(
        <PasswordEditor onClose={handleClose} updatePassword={updatePasswordAsync} />,
      );
    }
  }, []);

  return (
    <section className={css.settings_section}>
      <header className={css.settings_header}>
        <h1 className={css.settings_heading}>
          My Details
        </h1>
        <SvgButton
          type="button"
          name={OPEN_PASSWORD_EDITOR}
          title="Change Password"
          path={paths.lockReset}
          onClick={handleClick}
          sm
        />
      </header>
      <div className={css.settings_body}>
        <div className={css.stack_panel}>
          <TextBox
            name="email"
            id="email"
            label="Email"
            value={user.email}
            title={user.email}
            className={css.email_wrap}
            containerStyle={{ marginBottom: 0 }}
            style={{
              backgroundColor: '#eef3f3',
              paddingLeft: 8,
            }}
            hideErrorOnNull
            readOnly
          />
          <FieldEditor
            type="text"
            name="firstname"
            label="Firstname"
            initialValue={user.firstname}
            onSave={handleUpdate}
          />
          <FieldEditor
            type="text"
            name="lastname"
            label="Lastname"
            initialValue={user.lastname}
            onSave={handleUpdate}
          />
          <FieldEditor
            type="text"
            name="phone_number"
            label="Phone Number"
            initialValue={user.phoneNumber}
            onSave={handleUpdate}
          />
        </div>
      </div>
    </section>
  );
};

Details.propTypes = {
  user: userProps.isRequired,
};

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const form = useRef(null);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === SEARCH_TERM) {
      setSearchTerm(value);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchTerm) {
      setSearchTerm('');
      navigate(`${routes.user.dashboard.absolute.search}?term=${searchTerm}`);
    }
  }, [searchTerm]);

  return (
    <div className={css.search_form_wrap}>
      <form
        ref={form}
        onSubmit={handleSubmit}
      >
        <label htmlFor={SEARCH_TERM} className={css.search_box}>
          <input
            type="search"
            id={SEARCH_TERM}
            name={SEARCH_TERM}
            value={searchTerm}
            className={css.search_input}
            placeholder="What are you looking for?"
            onChange={handleValueChange}
          />
        </label>
      </form>
    </div>
  );
};

const Settings = ({ tab, user }) => {
  if (tab !== SETTINGS) {
    return null;
  }

  return (
    <section className={`${css.tab} ${css.settings}`}>
      <Location />
      <City user={user} />
      <Preferences user={user} />
      <Details user={user} />
    </section>
  );
};

Settings.propTypes = {
  tab: PropTypes.string,
  user: userProps.isRequired,
};

Settings.defaultProps = {
  tab: null,
};

const AppointmentsTab = ({ tab, appointments, onOpenMessages }) => {
  const [date, setDate] = useState(dateUtils.toNormalizedString(new Date()));
  const [sunday, setSunday] = useState();
  const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const sunday = dateUtils.toNormalizedString(dateUtils.getWeekStartDate(date));
    setSunday(sunday);
  }, [date, setSunday]);

  useEffect(() => {
    if (sunday) {
      dispatch(loadAppointmentsAsync({ from: sunday, days: 7 }, () => {}));
    }
  }, [sunday]);

  useEffect(() => {
    const dateString = dateUtils.toNormalizedString(date);
    setSelectedDateAppointments(appointments[dateString] || []);
  }, [date, appointments, setSelectedDateAppointments]);

  if (tab !== APPOINTMENTS) {
    return null;
  }

  return (
    <section className={`${css.tab} ${css.appointments_tab}`}>
      <header className={css.appointments_tab_header}>
        <DateButton date={date} onChange={setDate} />
      </header>
      <AppointmentsPanel
        date={date}
        appointments={selectedDateAppointments}
        onOpenMessages={onOpenMessages}
        hideHeader
      />
    </section>
  );
};

AppointmentsTab.propTypes = {
  tab: PropTypes.string,
  onOpenMessages: PropTypes.func.isRequired,
  appointments: PropTypes.shape({}).isRequired,
};

AppointmentsTab.defaultProps = {
  tab: null,
};

const BookmarkedCompanies = ({ tab }) => {
  const companies = useSelector(selectBookmarkedCompanies);
  const dispatch = useDispatch();

  const handleDelete = useCallback(({ target: { name } }) => {
    dispatch(deleteBookmarkedCompany(parseInt(name, 10)));
  }, []);

  if (tab !== BOOKMARKS) {
    return null;
  }

  return (
    <section className={`${css.tab} ${css.bookmarks}`}>
      <div className={css.bookmarks_notice}>
        Bookmarked companies are saved to your device.
      </div>
      {companies.length ? (
        <ul className={`list ${css.bookmarks_list}`}>
          {companies.map((company) => (
            <li key={company.id} className={css.bookmarks_list_item}>
              <Link
                className={css.bookmarks_list_link}
                to={routes.user.dashboard.absolute.providers(company.id)}
              >
                {company.name}
              </Link>
              <SvgButton
                type="button"
                name={company.id}
                title="Delete"
                color={colors.delete}
                path={paths.deleteOutline}
                onClick={handleDelete}
                sm
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className={`${css.empty_notice} ${css.sm} ${css.center}`}>
          You have NOT bookmarked any Companies!
        </div>
      )}
    </section>
  );
};

BookmarkedCompanies.propTypes = {
  tab: PropTypes.string,
};

BookmarkedCompanies.defaultProps = {
  tab: null,
};

const RestrictedUserPage = ({ user }) => {
  const [tab, setTab] = useState(SETTINGS);
  const [dashboardLinkVisible, setDashboardLinkVisible] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(true);
  const appointments = useSelector(selectAppointments);
  const openMessages = useSelector(selectOpenMessages);
  const { width: screenWidth } = useWindowSize();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMaxOpenMessages(Math.floor(screenWidth / 240) || 1));
  }, [screenWidth]);

  const handleTabHeaderClick = useCallback(({ target: { name } }) => setTab(name), []);

  const handleOpenMessages = useCallback((appointment) => {
    dispatch(openAppointmentMessages(appointment));
  }, []);

  const handleCloseMessages = useCallback((appointment) => {
    dispatch(closeAppointmentMessage(appointment));
  }, []);

  const toggleDrawerOpen = useCallback(() => setDrawerOpen((open) => !open), []);

  return (
    <div className="container">
      <Header />
      <div className={css.body}>
        <aside className={`aside ${css.aside} ${isDrawerOpen ? css.open : ''}`}>
          <div className={css.aside_header}>
            <SvgButton
              type="button"
              title="Open Drawer"
              color={colors.delete}
              path={paths.close}
              onClick={toggleDrawerOpen}
            />
          </div>
          <nav className={css.aside_nav}>
            {tabs.map((t) => (
              <button
                type="button"
                key={t.title}
                name={t.title}
                className={`${css.aside_nav_header} ${t.title === tab ? css.active : ''}`}
                onClick={handleTabHeaderClick}
              >
                <svg className="svg sm">
                  <path fill="currentColor" d={t.svgPath} />
                </svg>
                <span>{t.title}</span>
              </button>
            ))}
          </nav>
          <Settings tab={tab} user={user} />
          <BookmarkedCompanies tab={tab} />
          <AppointmentsTab
            tab={tab}
            appointments={appointments}
            onOpenMessages={handleOpenMessages}
          />
        </aside>
        <aside className={css.mini_aside}>
          <SvgButton
            type="button"
            title="Open Drawer"
            path={paths.backBurger}
            onClick={toggleDrawerOpen}
          />
        </aside>
        <main className={css.main}>
          <div className={css.page_header}>
            <div className={css.name_zone_wrap}>
              <div className={css.username}>{`Hi, ${user.firstname}`}</div>
              <div className={css.timezone}>
                <span>Timezone: </span>
                <span>{TIMEZONE}</span>
              </div>
            </div>
            <SearchBar />
            <Link
              to={routes.user.dashboard.absolute.home}
              className={`${css.dashboard_link} ${dashboardLinkVisible ? '' : css.hidden}`}
            >
              My Dashboard
            </Link>
          </div>
          <Outlet context={[user, setDashboardLinkVisible, handleOpenMessages]} />
          {openMessages.length ? (
            <div className={css.messages_panel}>
              {openMessages.map((appointment) => (
                <UserMessagePanel
                  key={appointment.id}
                  appointment={appointment}
                  onClose={handleCloseMessages}
                />
              ))}
            </div>
          ) : null}
        </main>
      </div>
      <WebSocketManager />
    </div>
  );
};

RestrictedUserPage.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number,
    firstname: PropTypes.string,
  }).isRequired,
};

const User = () => {
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to={routes.user.login}
        state={{ referrer: location.pathname }}
        replace
      />
    );
  }

  return <RestrictedUserPage user={user} />;
};

export default User;
