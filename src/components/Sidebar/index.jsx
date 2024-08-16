import { NavLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import LogoLink from '../LogoLink';
import routes from '../../routing/routes';
import dashboardIcon from '../../assets/images/dashboard2.svg';
import bookmarksIcon from '../../assets/images/bookmarks.svg';
import appointmentsIcon from '../../assets/images/appointments.svg';
import settingsIcon from '../../assets/images/settings.svg';
import logoutIcon from '../../assets/images/logout.svg';

const SidebarLink = ({
  to,
  isActive,
  icon,
  size,
  text,
}) => (
  <NavLink
    to={to}
    className={`w-full relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium text-lg text-[#8E98A8] dark:text-white duration-300 ease-in-out hover:bg-[#e6e8eB] dark:hover:bg-meta-4 ${
      isActive ? 'bg-[#e6e8eB] dark:bg-meta-4' : ''
    }`}
  >
    <span
      aria-hidden="true"
      className="w-8 h-8 bg-[#8E98A8] dark:bg-white"
      style={{
        height: size,
        maskImage: `url(${icon})`,
        maskSize: '100% 100%',
        width: size,
      }}
    />
    <span>{text}</span>
  </NavLink>
);

SidebarLink.propTypes = {
  to: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  icon: PropTypes.string.isRequired,
  size: PropTypes.number,
  text: PropTypes.string.isRequired,
};

SidebarLink.defaultProps = {
  isActive: false,
  size: 24,
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { pathname } = location;

  return (
    <aside
      className={`absolute lg:relative left-0 top-0 z-10 flex h-screen w-72.5 flex-col overflow-y-hidden bg-white duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 border-r border-slate-200 dark:border-[#3f444f] ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 pb-5.5 lg:pb-6.5">
        <div className="w-[326px] h-16 flex items-center">
          <LogoLink />
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="toggle sidebar"
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-hidden duration-300 ease-linear flex-1">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6 h-full overflow-auto">
          {/* <!-- Menu Group --> */}
          <div className="h-full w-full flex flex-col justify-between gap-6">
            <ul className="flex flex-col gap-1.5">
              <SidebarLink
                to={routes.user.dashboard.home}
                text="Dashboard"
                icon={dashboardIcon}
                isActive={pathname === routes.user.dashboard.absolute.home}
                size={18}
              />
              <SidebarLink
                to={routes.user.dashboard.absolute.bookmarks}
                text="Bookmarks"
                icon={bookmarksIcon}
                isActive={pathname === routes.user.dashboard.absolute.bookmarks}
                size={18}
              />
              <SidebarLink
                to={routes.user.dashboard.absolute.appointments}
                text="Appointments"
                icon={appointmentsIcon}
                isActive={pathname === routes.user.dashboard.absolute.appointments}
                size={18}
              />
            </ul>
            <ul className="mb-6 flex flex-col gap-1.5">
              <li className="my-2">
                <SidebarLink
                  to={routes.user.dashboard.absolute.settings}
                  text="Settings"
                  isActive={pathname === routes.user.dashboard.absolute.settings}
                  icon={settingsIcon}
                />
              </li>
              <li className="my-2">
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium text-lg text-[#8E98A8] dark:text-white duration-300 ease-in-out hover:bg-[#e6e8eB] dark:hover:bg-meta-4"
                >
                  <span
                    aria-hidden="true"
                    className="w-6 h-6 bg-[#8E98A8] dark:bg-white"
                    style={{ maskSize: '100% 100%', maskImage: `url(${logoutIcon})` }}
                  />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  sidebarOpen: PropTypes.bool,
  setSidebarOpen: PropTypes.func.isRequired,
};

Sidebar.defaultProps = {
  sidebarOpen: false,
};

export default Sidebar;
