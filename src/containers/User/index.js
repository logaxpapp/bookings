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
import { dateUtils, TIMEZONE } from '../../utils';
import Header from '../Header';
import UserLocation from '../../utils/userLocation';
import { SvgButton, colors, paths } from '../../components/svg';
import { useNotification } from '../../lib/Notification';
import { appointmentProps, userProps } from '../../utils/propTypes';
import {
  loadCountriesAsync,
  selectCountries,
} from '../../redux/countriesSlice';
import LoadingButton from '../../components/LoadingButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertComponent from '../../components/AlertComponents';
import { AccentRadioButton } from '../../components/Inputs';
import { FieldEditor } from '../../components/TextBox';
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

const APPOINTMENTS = 'appointments';
const BOOKMARKS = 'Bookmarks';
const CITY = 'city';
const COUNTRY = 'country';
const OPEN_PASSWORD_EDITOR = 'open_password_editor';
const REFRESH_LOCATION = 'refresh_location';
const SEARCH_TERM = 'search_term';
const SETTINGS = 'Settings';
const STATE = 'state';
const TOGGLE_CITY_FORM = 'open_city_form';

const stopPropagation = (e) => e.stopPropagation();

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

const Location = ({ onChange }) => {
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const notification = useNotification();

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
      UserLocation.getLocation().reload()
        .then((location) => {
          setLocation(location);
          if (onChange) {
            onChange(location);
          }
        })
        .catch(({ message }) => notification.showError(message));
    }
  }, [onChange]);

  return (
    <section className={css.settings_section}>
      <header className={css.settings_header}>
        <h1 className={css.settings_heading}>
          Preferred Location
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

const CityEditor = ({ user }) => {
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

  useEffect(() => {
    if (!countries) {
      reload();
    }
  }, []);

  useEffect(() => {
    if (user.city && countries) {
      setCountry(countries.find((c) => c.id === user.city.state.country.id));
    }
  }, [user, countries, setCountry]);

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
    dispatch(updateUserCityAsync(city, state, country, () => {
      setBusy(false);
    }));
  }, [city, state, country, setBusy]);

  if (!countries) {
    return <></>;
  }

  if (loading) {
    return (
      <LoadingSpinner>
        <span>Loading ...</span>
      </LoadingSpinner>
    );
  }

  if (loadError) {
    return (
      <div style={{ display: 'flex', gap: 8, textAlign: 'center' }}>
        <span>Application encountered an error while loading Countries. Please Click</span>
        <button type="button" className="link" onClick={reload}>here</button>
        <span>to reload</span>
      </div>
    );
  }

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
  user: userProps.isRequired,
};

const City = ({ user }) => {
  const [formOpen, setFormOpen] = useState(true);

  useEffect(() => {
    if (user.city) {
      setFormOpen(false);
    }
  }, [user, setFormOpen]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === TOGGLE_CITY_FORM) {
      setFormOpen(!formOpen);
    }
  }, [user, formOpen, setFormOpen]);

  return (
    <section className={css.settings_section}>
      <header className={css.settings_header}>
        <h1 className={css.settings_heading}>
          My City
        </h1>
        <SvgButton
          type="button"
          name={TOGGLE_CITY_FORM}
          title="Refresh"
          path={paths.chevronUp}
          onClick={handleClick}
          className={`${css.direction_btn} ${formOpen ? css.up : ''}`}
          sm
        />
      </header>
      <div className={css.settings_body}>
        <div
          className={`${css.city_wrap} ${user.city ? '' : css.empty} ${formOpen ? css.open : ''}`}
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
          <div className={`${css.city_editor_wrap} ${formOpen ? css.open : ''}`}>
            <CityEditor user={user} />
          </div>
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
    if (hasPreferredLocation && savedSearhParams === searchParamsOptions.PREFERRED_LOCATION) {
      setSearchParam(searchParamsOptions.PREFERRED_LOCATION);
    } else if (savedSearhParams === searchParamsOptions.User_CITY && user.city) {
      setSearchParam(searchParamsOptions.User_CITY);
    } else {
      setSearchParam(searchParamsOptions.CURRENT_LOCATION);
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
            id={searchParamsOptions.PREFERRED_LOCATION}
            name={searchParamsOptions.PREFERRED_LOCATION}
            disabled={!hasPreferredLocation}
            checked={searchParam === searchParamsOptions.PREFERRED_LOCATION}
            label="Use My Preferred Location"
            onChange={handleRadioCheck}
            labelStyle={{ fontSize: '0.8rem' }}
          />
          <AccentRadioButton
            id={searchParamsOptions.CURRENT_LOCATION}
            name={searchParamsOptions.CURRENT_LOCATION}
            checked={searchParam === searchParamsOptions.CURRENT_LOCATION}
            label="Use My Current Location"
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
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const searchInput = useRef(null);
  const form = useRef(null);
  const searchBtn = useRef(null);

  const blurSearchInput = useCallback(() => {
    document.removeEventListener('mousedown', blurSearchInput);
    setSearchFocused(false);
  }, []);

  const focusSearchInput = useCallback(() => {
    searchInput.current.focus();
    setSearchFocused(true);
    form.current.addEventListener('mousedown', stopPropagation);
    document.addEventListener('mousedown', blurSearchInput);
  }, []);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === SEARCH_TERM) {
      setSearchTerm(value);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!searchFocused) {
      focusSearchInput();
      return;
    }
    if (searchTerm) {
      setSearchTerm('');
      setSearchFocused(false);
      navigate(`${routes.user.dashboard.absolute.search}?term=${searchTerm}`);
    }
  }, [searchTerm, searchFocused, setSearchFocused, setSearchTerm, focusSearchInput]);

  return (
    <div className={css.search_form_wrap}>
      <form
        ref={form}
        onSubmit={handleSubmit}
        className={`${css.search_form} ${searchFocused ? css.focused : ''}`}
      >
        <div className={css.search_box}>
          <input
            ref={searchInput}
            type="search"
            id={SEARCH_TERM}
            name={SEARCH_TERM}
            value={searchTerm}
            className={css.search_input}
            placeholder="What are you looking for?"
            onChange={handleValueChange}
          />
          <button ref={searchBtn} type="submit" className={css.search_btn}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`${css.feather} ${css.feather_search}`}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
        <button type="button" className={css.search_prompt} onClick={focusSearchInput}>
          What are you looking for?
        </button>
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
