import {
  Fragment,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

import css from './style.module.css';
import lx from '../../assets/images/logaxp.png';
import routes from '../../routing/routes';
import {
  selectUser,
  logout as logoutUser,
  updatePasswordAsync as updateUserPassword,
} from '../../redux/userSlice';
import {
  selectCompany,
  logout as logoutCompany,
  updatePasswordAsync as updateCompanyPassword,
} from '../../redux/companySlice';
import Modal from '../../components/Modal';
import { SvgButton, paths } from '../../components/svg';
import AuthTypeChooser from '../Authentication/AuthTypeChooser';
import UserMenu from '../../components/UserMenu';
import PasswordEditorDialog from '../Authentication/PasswordEditor';

const LOGIN = 'login';
const REGISTER = 'register';

export const DrawerNavBar = ({
  isLoggedIn,
  dashboardPath,
  logout,
  changePassword,
}) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = useCallback(() => setOpen((open) => !open), []);

  return (
    <section className={css.drawer_nav_bar}>
      <div className={`app-bg ${css.drawer_nav_hamburger_nav}`}>
        <div className={css.main_nav_brand}>LogaXP</div>
        <SvgButton
          type="button"
          color="#546673"
          title="Menu"
          onClick={toggleOpen}
          style={{ pointerEvents: 'all' }}
          path="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"
        />
      </div>
      <div className={`${css.drawer} ${open ? css.open : ''}`}>
        <div className={css.drawer_header}>
          <SvgButton
            type="button"
            color="red"
            title="Close"
            path={paths.close}
            onClick={toggleOpen}
          />
        </div>
        <nav>
          <ul className="list">
            <li><Link to={routes.home}>Home</Link></li>
            {isLoggedIn ? (
              <li><Link to={dashboardPath}>Dashboard</Link></li>
            ) : null}
            <li><Link to={routes.pricing}>Pricing</Link></li>
            <li className={css.menu_demarcator}>
              <Link to={routes.contact}>Contact Us</Link>
            </li>
            {isLoggedIn ? null : (
              <li><Link to={routes.login}>Login</Link></li>
            )}
            <li>
              <Link to={routes.register}>Sign Up</Link>
            </li>
            {isLoggedIn ? (
              <>
                <li>
                  <button
                    type="button"
                    className={css.drawer_logout_btn}
                    onClick={changePassword}
                  >
                    Update Password
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={css.drawer_logout_btn}
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : null}
          </ul>
        </nav>
      </div>
    </section>
  );
};

DrawerNavBar.propTypes = {
  isLoggedIn: PropTypes.bool,
  dashboardPath: PropTypes.string,
  logout: PropTypes.func.isRequired,
  changePassword: PropTypes.func.isRequired,
};

DrawerNavBar.defaultProps = {
  isLoggedIn: false,
  dashboardPath: '',
};

const classNames = (...classes) => classes.filter(Boolean).join(' ');

const LoginMenu = ({ signedIn }) => {
  if (signedIn) {
    return null;
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-6 rounded-md bg-[#89E101] px-4 py-3 text-md font-semibold text-white shadow-sm ring-1 ring-inset ring-[#89E101] hover:bg-[#5bc746]">
          <span>Login</span>
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-white" aria-hidden="true" />
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none min-w-min">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block px-4 py-2 text-left text-lg whitespace-nowrap w-[280px]',
                  )}
                  to={routes.company.absolute.login}
                >
                  Login as Service Provider
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block w-full px-4 py-2 text-left text-lg',
                  )}
                  to={routes.user.login}
                >
                  Login as User
                </Link>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

LoginMenu.propTypes = {
  signedIn: PropTypes.bool,
};

LoginMenu.defaultProps = {
  signedIn: false,
};

const Header = ({ transparent }) => {
  const [state, setState] = useState({ signedIn: false, dashboardPath: '' });
  const [authChooserParams, setAuthChooserParams] = useState(null);
  const [isUpdatingPassword, setUpdatingPassword] = useState(false);
  const user = useSelector(selectUser);
  const company = useSelector(selectCompany);
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (company) {
      setState({
        signedIn: true,
        dashboardPath: routes.company.absolute.dashboard,
      });
    } else if (user) {
      setState({
        signedIn: true,
        dashboardPath: routes.user.dashboard.absolute.home,
      });
    } else {
      setState({ signedIn: false, dashboardPath: '' });
    }
  }, [company, user, setState]);

  const logout = () => {
    if (company) {
      dispatch(logoutCompany());
    } else if (user) {
      dispatch(logoutUser());
    }
    navigate(routes.home);
  };

  const handleClick = useCallback((e) => {
    e.preventDefault();

    const { target: { name } } = e;

    if (name === LOGIN) {
      setAuthChooserParams({
        companyRoute: routes.company.absolute.login,
        userRoute: routes.user.login,
      });
    } else if (name === REGISTER) {
      setAuthChooserParams({
        companyRoute: routes.company.absolute.registration,
        userRoute: routes.user.registeration,
      });
    }
  }, []);

  return (
    <header className={`${css.header} ${transparent ? css.transparent : ''}`} id="page-main-header">
      <nav className={css.nav}>
        <Link className={css.main_nav_brand} to={routes.home}>
          <img src={lx} alt="logo" className={css.logo} />
          <div className={css.nav_brand_wrap}>
            <span className={css.loga}>Loga</span>
            <span className={css.xp}>XP</span>
          </div>
        </Link>
        <div className={css.menus_wrap}>
          <ul className={`${css.menu} ${css.main_menu}`}>
            <li className={css.menu_item}>
              <Link
                to={routes.home}
                className={`${css.menu_link} ${pathname === routes.home ? css.active : ''}`}
              >
                Home
              </Link>
            </li>
            {state.signedIn ? (
              <li>
                <Link
                  className={`${css.menu_link} ${pathname.startsWith(user ? routes.user.dashboard.absolute.home : routes.company.absolute.dashboard) ? css.active : ''}`}
                  to={user
                    ? routes.user.dashboard.absolute.home
                    : routes.company.absolute.dashboard}
                >
                  My Dashboard
                </Link>
              </li>
            ) : null}
            <li className={css.menu_item}>
              <Link
                to={routes.pricing}
                className={`${css.menu_link} ${pathname === routes.pricing ? css.active : ''}`}
              >
                Pricing
              </Link>
            </li>
            <li className={css.menu_item}>
              <Link
                to={routes.contact}
                className={`${css.menu_link} ${pathname === routes.contact ? css.active : ''}`}
              >
                Contact
              </Link>
            </li>
          </ul>
          <ul className={css.menu}>
            <LoginMenu signedIn={state.signedIn} />
            <li>
              <button
                type="button"
                name={REGISTER}
                className={`${css.menu_link} ${css.register_menu_item}`}
                onClick={handleClick}
              >
                Get Started
              </button>
            </li>
            <UserMenu color={transparent ? '#fff' : '#011c39'} />
          </ul>
        </div>
      </nav>
      <DrawerNavBar
        isLoggedIn={state.signedIn}
        dashboardPath={state.dashboardPath}
        logout={logout}
        changePassword={() => setUpdatingPassword(true)}
      />
      <Modal
        isOpen={!!authChooserParams}
        parentSelector={() => document.body}
        onRequestClose={() => setAuthChooserParams(null)}
        style={{
          content: { maxWidth: 'max-content', borderRadius: 24 },
          overlay: { zIndex: 100 },
        }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        {authChooserParams ? (
          <AuthTypeChooser
            companyRoute={authChooserParams.companyRoute}
            userRoute={authChooserParams.userRoute}
          />
        ) : null}
      </Modal>
      <PasswordEditorDialog
        isOpen={isUpdatingPassword}
        onClose={() => setUpdatingPassword(false)}
        updatePassword={user ? updateUserPassword : updateCompanyPassword}
      />
    </header>
  );
};

Header.propTypes = {
  transparent: PropTypes.bool,
};

Header.defaultProps = {
  transparent: false,
};

export default Header;
