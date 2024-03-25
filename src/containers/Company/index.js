import {
  Fragment,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Menu, Transition } from '@headlessui/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BellIcon } from '@heroicons/react/20/solid';
import oldCss from './oldStyles.module.css';
import css from './styles.module.css';
import routes from '../../routing/routes';
import Header from '../Header';
import {
  closeAppointmentMessage,
  fetchCompanyAsync,
  logout,
  selectCompany,
  selectEmployee,
  selectOpenMessages,
  selectPermissions,
  sendAppointmentMessageAsync,
  setMaxOpenMessages,
} from '../../redux/companySlice';
import { TIMEZONE, capitalize } from '../../utils';
import { paths } from '../../components/svg';
import { appointmentProps } from '../../utils/propTypes';
import MessagePanel from '../../components/MessagePanel';
import WebSocketManager from './WebSocketManager';
import { useWindowSize } from '../../lib/hooks';
import AppStorage from '../../utils/appStorage';
import BlankPageContainer from '../../components/BlankPageContainer';
import LoadingSpinner from '../../components/LoadingSpinner';
import LogoLink from '../../components/LogoLink';
import UserMenu from '../../components/UserMenu';
import EmptyListPanel from '../../components/EmptyListPanel';
import logoutIcon from '../../assets/images/logout.svg';

const storage = AppStorage.getInstance();

const mainLinks = [
  {
    title: 'Dashboard',
    route: routes.company.absolute.dashboard,
    getClass: (path) => `${css.main_link} ${css.calendar} ${path === routes.company.absolute.dashboard ? css.active : ''}`,
  },
  {
    title: 'Services',
    route: routes.company.services.home,
    getClass: (path) => `${css.main_link} ${css.list} ${path.startsWith(routes.company.absolute.services.home) ? css.active : ''}`,
  },
  {
    title: 'Customers',
    route: routes.company.absolute.customers,
    getClass: (path) => `${css.main_link} ${css.users} ${path === routes.company.absolute.customers ? css.active : ''}`,
  },
  // {
  //   title: 'TODO',
  //   route: routes.company.absolute.dashboard,
  //   getClass: (path) => `${css.main_link} ${css.dashboard}
  // ${path === routes.company.absolute.dashboard ? css.active : ''}`,
  // },
  {
    title: 'Settings',
    route: routes.company.absolute.settings.base,
    getClass: (path) => `${css.main_link} ${css.settings} ${path.startsWith(routes.company.absolute.settings.base) ? css.active : ''}`,
  },
];

const MainLinks = ({ path }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signout = () => {
    dispatch(logout());
    navigate(routes.home);
  };

  return (
    <aside className="flex md:flex-col px-6 py-10 gap-3 border-e w-[80px]">
      {mainLinks.map(({
        getClass,
        route,
        title,
      }) => (
        <Link
          key={title}
          title={title}
          to={route}
          className={getClass(path)}
        />
      ))}
      <button
        aria-label="Logout"
        type="button"
        className={css.main_link}
        onClick={signout}
        style={{ padding: 6 }}
      >
        <img
          alt="logout"
          src={logoutIcon}
          className="w-full h-full"
        />
      </button>
    </aside>
  );
};

MainLinks.propTypes = {
  path: PropTypes.string.isRequired,
};

const styles = {
  messagePanel: {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100%',
    height: '100vh',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: 8,
    padding: 4,
    pointerEvents: 'none',
  },
};

const links = [
  {
    title: 'Dashboard',
    route: routes.company.absolute.dashboard,
    svgPath: 'M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z',
    isActive: (pathname) => pathname === routes.company.absolute.dashboard,
    overflow: '',
  },
  {
    title: 'Setup',
    route: routes.company.absolute.setup,
    svgPath: 'M22.7,19L13.6,9.9C14.5,7.6 14,4.9 12.1,3C10.1,1 7.1,0.6 4.7,1.7L9,6L6,9L1.6,4.7C0.4,7.1 0.9,10.1 2.9,12.1C4.8,14 7.5,14.5 9.8,13.6L18.9,22.7C19.3,23.1 19.9,23.1 20.3,22.7L22.6,20.4C23.1,20 23.1,19.3 22.7,19Z',
    overflow: '',
    isActive: (pathname) => pathname.startsWith(routes.company.absolute.setup),
  },
  {
    title: 'Settings',
    route: routes.company.absolute.settings.base,
    svgPath: 'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z',
    overflow: '',
    isActive: (pathname) => pathname.startsWith(routes.company.absolute.settings.base),
  },
  {
    title: 'Profile Page',
    route: routes.company.absolute.profile,
    svgPath: 'M16,12H15V10H13V7H14V9H15V7H16M11,10H9V11H11V12H8V9H10V8H8V7H11M19,7V4H5V7H2V20H10V16H14V20H22V7H19Z',
    overflow: 'M20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20Z',
    isActive: (pathname) => pathname === routes.company.absolute.profile,
  },
  {
    title: 'Business Card',
    route: routes.company.absolute.card,
    svgPath: 'M20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20Z',
    overflow: 'overflow',
    isActive: (pathname) => pathname === routes.company.absolute.card,
  },
  {
    title: 'Calendar',
    route: routes.company.absolute.calendar,
    svgPath: paths.calendar,
    overflow: 'overflow',
    isActive: (pathname) => pathname === routes.company.absolute.calendar,
  },
  {
    title: 'Employees',
    route: routes.company.absolute.employees,
    svgPath: paths.accountMultiple,
    overflow: 'overflow',
    isActive: (pathname) => pathname === routes.company.absolute.employees,
  },
  {
    title: 'Return Policy',
    route: routes.company.returnPolicy,
    svgPath: paths.cardRefund,
    overflow: 'overflow',
    isActive: (pathname) => pathname === routes.company.absolute.returnPolicy,
  },
];

const overflowLinks = links.filter((l, idx) => idx > 3);

const OverflowMenu = ({ isOpen, close }) => {
  const handleClose = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleLinkClick = useCallback(() => {
    setTimeout(close, 10);
  }, []);

  if (!isOpen) {
    return null;
  }

  /* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

  return (
    <div
      role="dialog"
      className="overflow-menu-dialog"
      onMouseDown={close}
    >
      <nav role="menu" tabIndex={0} className="overflow-menu" onMouseDown={handleClose}>
        {overflowLinks.map((link) => (
          <Link
            key={link.title}
            to={link.route}
            className="main-aside-link overflow-item"
            onClick={handleLinkClick}
          >
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d={link.svgPath} />
            </svg>
            <span>{link.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
  /* eslint-enable jsx-a11y/no-noninteractive-element-to-interactive-role */
  /* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
};

OverflowMenu.propTypes = {
  isOpen: PropTypes.bool,
  close: PropTypes.func.isRequired,
};

OverflowMenu.defaultProps = {
  isOpen: false,
};

const CompanyMessagePanel = ({ appointment, onClose }) => {
  const [title, setTitle] = useState('');
  const [rider, setRider] = useState('');
  const [messages, setMessages] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    setTitle(`${appointment.customer.lastname} ${appointment.customer.firstname}`);
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
      username="Company"
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  );
};

CompanyMessagePanel.propTypes = {
  appointment: appointmentProps.isRequired,
  onClose: PropTypes.func.isRequired,
};

const RestrictedCompany2 = ({ company, pathname }) => {
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [menus, setMenus] = useState([]);
  const employee = useSelector(selectEmployee);
  const openMessages = useSelector(selectOpenMessages);
  const permissions = useSelector(selectPermissions);
  const { width: screenWidth } = useWindowSize();
  const dispatch = useDispatch();

  const toggleOverflow = useCallback(() => setOverflowOpen((overflow) => !overflow), []);

  useEffect(() => {
    dispatch(setMaxOpenMessages(Math.floor(screenWidth / 240) || 1));
  }, [screenWidth, setMaxOpenMessages]);

  useEffect(() => {
    if (permissions.isAdmin) {
      setMenus(links);
    } else {
      setMenus(links.filter(({ route }) => route !== routes.company.absolute.setup));
    }
  }, [permissions]);

  const handleCloseMessages = useCallback((appointment) => {
    dispatch(closeAppointmentMessage(appointment));
  }, []);

  return (
    <div className="container">
      <Header />
      <div className="body">
        <aside className="aside">
          <div className="timezone">
            <span className="timezone-label">Timezone:</span>
            <span>{TIMEZONE}</span>
          </div>
          <div className={oldCss.employee_name}>
            <span>{`Signed In as ${capitalize(employee.firstname)}`}</span>
          </div>
          <nav className="aside-nav">
            {menus.map((link) => (
              <Link
                key={link.title}
                to={link.route}
                className={`main-aside-link ${link.overflow} ${link.isActive(pathname) ? 'active' : ''}`}
              >
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d={link.svgPath} />
                </svg>
                <span className="main-aside-link-label">{link.title}</span>
              </Link>
            ))}
            <button
              aria-label="more"
              type="button"
              className="main-aside-link overflow-menu-open-btn"
              onClick={toggleOverflow}
            >
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d={paths.more} />
              </svg>
            </button>
            <OverflowMenu isOpen={overflowOpen} close={toggleOverflow} />
          </nav>
        </aside>
        <Outlet context={[company]} />
      </div>
      {openMessages.length ? (
        <div style={styles.messagePanel}>
          {openMessages.map((appointment) => (
            <CompanyMessagePanel
              key={appointment.id}
              appointment={appointment}
              onClose={handleCloseMessages}
            />
          ))}
        </div>
      ) : null}
      <WebSocketManager />
    </div>
  );
};

RestrictedCompany2.propTypes = {
  company: PropTypes.shape({}).isRequired,
  pathname: PropTypes.string.isRequired,
};

const Notifications = () => (
  <Menu as="div" className="relative inline-block text-left">
    <div>
      <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
        <BellIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
      </Menu.Button>
    </div>

    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items
        className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none w-min"
      >
        <div className="py-4 w-80">
          <EmptyListPanel
            text="🎉 You've checked all your notifications and there's nothing new to report."
            textClass="font-normal text-lg"
          />
        </div>
      </Menu.Items>
    </Transition>
  </Menu>
);

const RestrictedCompany = ({ company, pathname }) => {
  const openMessages = useSelector(selectOpenMessages);
  const { width: screenWidth } = useWindowSize();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMaxOpenMessages(Math.floor(screenWidth / 240) || 1));
  }, [screenWidth, setMaxOpenMessages]);

  const handleCloseMessages = useCallback((appointment) => {
    dispatch(closeAppointmentMessage(appointment));
  }, []);

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden relative" id="company-panel">
      <header className="flex justify-between items-center h-16 px-8 border-b">
        <div className="w-[326px] h-16 flex items-center border-e">
          <LogoLink />
        </div>
        <div className="flex gap-2 items-center">
          <Notifications />
          <UserMenu />
        </div>
      </header>
      <div className="flex flex-col-reverse md:flex-row flex-1 overflow-hidden">
        <MainLinks path={pathname} />
        <Outlet context={[company]} />
      </div>
      {openMessages.length ? (
        <div style={styles.messagePanel}>
          {openMessages.map((appointment) => (
            <CompanyMessagePanel
              key={appointment.id}
              appointment={appointment}
              onClose={handleCloseMessages}
            />
          ))}
        </div>
      ) : null}
      <WebSocketManager />
    </div>
  );
};

RestrictedCompany.propTypes = {
  company: PropTypes.shape({}).isRequired,
  pathname: PropTypes.string.isRequired,
};

const Company = () => {
  const company = useSelector(selectCompany);
  const location = useLocation();
  const [state, setState] = useState({ loading: true, error: '' });
  const dispatch = useDispatch();

  useEffect(() => {
    const token = storage.getEmployeeToken();
    if (token) {
      dispatch(fetchCompanyAsync(token, (err) => {
        setState({ loading: false, error: err });
      }));
    } else {
      setState({ loading: false, error: 'No Token Found' });
    }
  }, []);

  if (state.loading) {
    return (
      <BlankPageContainer>
        <LoadingSpinner>
          <span>Loading ...</span>
        </LoadingSpinner>
      </BlankPageContainer>
    );
  }

  if (!company) {
    if (state.error) {
      return (
        <Navigate
          to={routes.company.absolute.login}
          state={{ referrer: location.pathname }}
          replace
        />
      );
    }

    return null;
  }

  return <RestrictedCompany company={company} pathname={location.pathname} />;
};

export default Company;
