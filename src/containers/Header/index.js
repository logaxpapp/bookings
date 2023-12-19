import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import PropTypes from 'prop-types';
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
import { SvgButton, paths } from '../../components/svg';
import { useDialog } from '../../lib/Dialog';
import PasswordEditor from '../PasswordEditor';
/* eslint-disable-next-line */
import useAuthChooser from '../AuthTypeChooser/useAuthChooser';

const CHANGE_PASSWORD = 'change_password';
const DASHBOARD_BTN = 'password_btn';
const LOGIN = 'login';
const LOGOUT = 'logout';
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

const UserMenu = ({
  isSignedIn,
  logout,
  changePassword,
  dashboardLink,
}) => {
  const navigate = useNavigate();

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === LOGOUT) {
      logout();
    } else if (name === CHANGE_PASSWORD) {
      changePassword();
    } else if (name === DASHBOARD_BTN) {
      navigate(dashboardLink);
    }
  }, []);

  if (!isSignedIn) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={css.globe}>
        <title>earth</title>
        <path fill="currentColor" d="M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A1,1 0 0,0 14,12H8V10H10A1,1 0 0,0 11,9V7H13A2,2 0 0,0 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.05,19.44 4,16.08 4,12C4,11.38 4.08,10.78 4.21,10.21L9,15V16A2,2 0 0,0 11,18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
      </svg>
    );
  }

  return (
    <div className={css.user_menu}>
      <svg viewBox="0 0 24 24" width={24} height={24} className="pointer-events-none">
        <path color="currentColor" d={paths.account} />
      </svg>
      <div
        role="menu"
        className={`context-menu ${css.user_menu_popup}`}
      >
        <button
          role="menuitem"
          type="button"
          name={DASHBOARD_BTN}
          className="menu-item"
          onMouseDown={handleClick}
        >
          My Dashboard
        </button>
        <button
          role="menuitem"
          type="button"
          name={CHANGE_PASSWORD}
          className="menu-item"
          onMouseDown={handleClick}
        >
          Change Password
        </button>
        <button
          role="menuitem"
          type="button"
          name={LOGOUT}
          className="menu-item"
          onMouseDown={handleClick}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

UserMenu.propTypes = {
  isSignedIn: PropTypes.bool.isRequired,
  dashboardLink: PropTypes.string.isRequired,
  logout: PropTypes.func.isRequired,
  changePassword: PropTypes.func.isRequired,
};

const Header = ({ transparent }) => {
  const [state, setState] = useState({ signedIn: false, dashboardPath: '' });
  const user = useSelector(selectUser);
  const company = useSelector(selectCompany);
  const { pathname } = useLocation();
  const authChooser = useAuthChooser();
  const dialog = useDialog();
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

  const logout = useCallback(() => {
    if (company) {
      dispatch(logoutCompany());
    } else if (user) {
      dispatch(logoutUser());
    }
    navigate(routes.home);
  }, [user, company]);

  const changePassword = useCallback(() => {
    let popup;
    const handleClose = () => popup.close();
    popup = dialog.show(
      <PasswordEditor
        onClose={handleClose}
        updatePassword={user ? updateUserPassword : updateCompanyPassword}
      />,
    );
  }, [user]);

  const handleClick = useCallback((e) => {
    e.preventDefault();

    const { target: { name } } = e;

    if (name === LOGIN) {
      authChooser.show(
        () => navigate(routes.company.absolute.login),
        () => navigate(routes.user.login),
      );
    } else if (name === REGISTER) {
      authChooser.show(
        () => navigate(routes.company.absolute.registration),
        () => navigate(routes.user.registeration),
      );
    }
  }, [authChooser, navigate]);

  return (
    <header className={`${css.header} ${transparent ? css.transparent : ''}`}>
      {transparent ? <div className={css.dimmer} /> : null}
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
            {state.signedIn ? null : (
              <li className={`${css.has_sub_menu_d1} ${css.menu_item}`}>
                <Link
                  name={LOGIN}
                  to={routes.login}
                  className={css.menu_link}
                  onClick={handleClick}
                >
                  Login
                </Link>
                <ul className={`list ${css.sub_menu_d1}`}>
                  <li>
                    <Link
                      to={routes.company.absolute.login}
                      className={css.sub_menu_link}
                    >
                      Service Provider Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={routes.user.login}
                      className={css.sub_menu_link}
                    >
                      User Login
                    </Link>
                  </li>
                </ul>
              </li>
            )}
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
            <UserMenu
              isSignedIn={state.signedIn}
              dashboardLink={state.dashboardPath}
              logout={logout}
              changePassword={changePassword}
            />
          </ul>
        </div>
      </nav>
      <DrawerNavBar
        isLoggedIn={state.signedIn}
        dashboardPath={state.dashboardPath}
        logout={logout}
        changePassword={changePassword}
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
