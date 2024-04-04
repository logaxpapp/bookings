import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useOutletContext } from 'react-router';
import {
  Link,
  Navigate,
  Outlet,
  useNavigate,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import css from './styles.module.css';
import { FieldEditor } from '../../../components/TextBox';
import { logout, selectPermissions, updateCompanyAsync } from '../../../redux/companySlice';
import routes from '../../../routing/routes';
import { capitalize } from '../../../utils';
import { Ring } from '../../../components/LoadingButton';
import Aside, { Heading } from '../../Aside';

const ABOUT_US = 'about_us';
const SAVE = 'save';
const links = {
  Settings: [
    {
      title: 'Brand',
      to: routes.company.settings.brand,
    },
    {
      title: 'Profile',
      to: routes.company.settings.profile,
    },
    {
      title: 'Your Team',
      to: routes.company.settings.team,
    },
    {
      title: 'Services',
      to: routes.company.settings.services,
    },
    {
      title: 'General',
      to: routes.company.settings.general,
    },
  ],
  MANAGE: [
    {
      title: 'Booking Page',
      to: routes.company.settings.page,
    },
    {
      title: 'Payments',
      to: routes.company.settings.payments,
    },
    {
      title: 'Reports',
      to: routes.company.settings.reports,
    },
    {
      title: 'Billing',
      to: routes.company.settings.billing,
    },
    {
      title: 'Notifications',
      to: routes.company.settings.notifications,
    },
    {
      title: 'Reviews',
      to: routes.company.settings.reviews,
    },
  ],
  OTHERS: [
    {
      title: 'Downloads',
      to: routes.company.settings.downloads,
    },
    {
      title: 'Activities',
      to: routes.company.settings.activities,
    },
    {
      title: 'Refer a friend',
      to: routes.company.settings.refer,
    },
  ],
};

const linkGroups = Object.keys(links);

const Menu = ({ title, to, pathname }) => {
  const className = useMemo(() => {
    let name = css.menu;
    if (pathname === `/companies/settings${to ? '/' : ''}${to}`) {
      name = `${name} ${css.active}`;
    }

    return name;
  }, [pathname, to]);

  return (
    <Link to={to} className={className}>
      <span>{title}</span>
    </Link>
  );
};

Menu.propTypes = {
  title: PropTypes.string.isRequired,
  pathname: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};

const menus = [
  {
    title: 'Details',
    to: routes.company.absolute.settings.details,
    isActive: (pathname) => pathname === routes.company.absolute.settings.details,
  },
  {
    title: 'Categories',
    to: routes.company.absolute.settings.serviceCategories,
    isActive: (pathname) => pathname === routes.company.absolute.settings.serviceCategories,
  },
  {
    title: 'Services',
    to: routes.company.absolute.settings.services,
    isActive: (pathname) => pathname.startsWith(routes.company.absolute.settings.services),
  },
  {
    title: 'Timeslots',
    to: routes.company.absolute.settings.timeSlots,
    isActive: (pathname) => pathname.startsWith(routes.company.absolute.settings.timeSlots),
  },
];

export const CompanyDetailsSettings = () => {
  const [company] = useOutletContext();
  const [aboutUs, setAboutUs] = useState(company.aboutUs || '');
  const [updatingAboutUs, setUpdatingAboutUs] = useState(false);
  const permissions = useSelector(selectPermissions);
  const dispatch = useDispatch();

  const handleUpdate = useCallback((name, value, callback) => (
    dispatch(updateCompanyAsync({ [name]: value }, callback))
  ), []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === SAVE) {
      setUpdatingAboutUs(true);
      handleUpdate('about_us', aboutUs, () => {
        setUpdatingAboutUs(false);
      });
    }
  }, [aboutUs, handleUpdate]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === ABOUT_US) {
      setAboutUs(value);
    }
  }, []);

  if (!permissions.isAdmin) {
    return <Navigate to={routes.company.absolute.settings.serviceCategories} replace />;
  }

  return (
    <section className={css.content}>
      <div className={css.details_wrap}>
        <h1 className={`${css.h1} ${css.pad}`}>Company Details</h1>
        <div className={css.details_row}>
          <FieldEditor
            type="text"
            name="name"
            initialValue={company.name}
            label="Name"
            onSave={handleUpdate}
          />
          <FieldEditor
            type="text"
            name="phone_number"
            initialValue={company.phoneNumber}
            label="Phone Number"
            onSave={handleUpdate}
          />
        </div>
        <div className={css.details_row}>
          <FieldEditor
            type="text"
            name="category"
            initialValue={capitalize(company.category)}
            label="Category"
            onSave={handleUpdate}
          />
          <FieldEditor
            type="text"
            name="address"
            initialValue={company.address}
            label="Address"
            onSave={handleUpdate}
          />
        </div>
        <div className={css.details_row}>
          <FieldEditor
            type="text"
            name="slogan"
            initialValue={company.slogan || ''}
            label="Slogan"
            onSave={handleUpdate}
            inputStyle={{ height: 40 }}
          />
        </div>
        <div className={css.about_us_wrap}>
          <label className={`input-label ${css.about_us_label}`} htmlFor={ABOUT_US}>
            <span className="input-label-text">About Us</span>
            <textarea
              name={ABOUT_US}
              id={ABOUT_US}
              value={aboutUs}
              className={css.about_us}
              onChange={handleValueChange}
            />
          </label>
          <div className={css.about_us_controls}>
            {updatingAboutUs ? (
              <Ring size={18} />
            ) : (
              <button
                type="button"
                name={SAVE}
                className={css.accent_btn}
                onClick={handleClick}
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export const CompanySettings2 = () => {
  const [links, setLinks] = useState([]);
  const [company] = useOutletContext();
  const { pathname } = useLocation();
  const permissions = useSelector(selectPermissions);

  useEffect(() => {
    if (permissions.isAdmin) {
      setLinks(menus);
    } else {
      setLinks(menus.filter(({ to }) => to !== routes.company.absolute.settings.details));
    }
  }, []);

  return (
    <main className={css.main}>
      <nav className={css.nav}>
        {links.map((menu) => (
          <Link
            key={menu.title}
            className={`main-aside-link ${css.link} ${menu.isActive(pathname) ? `active ${css.active}` : ''}`}
            to={menu.to}
          >
            {menu.title}
          </Link>
        ))}
      </nav>
      <Outlet context={[company]} />
    </main>
  );
};

const CompanySettings = () => {
  const [company] = useOutletContext();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signout = () => {
    dispatch(logout());
    navigate(routes.home);
  };

  return (
    <div className="flex-1 h-full flex" id="service-container-id">
      <Aside>
        <div className="flex flex-col gap-5">
          {linkGroups.map((group) => (
            <div key={group}>
              <Heading>{group}</Heading>
              {links[group].map((link) => (
                <Menu key={link.title} title={link.title} to={link.to} pathname={pathname} />
              ))}
              {group === 'OTHERS' ? (
                <button
                  type="button"
                  className={css.menu}
                  onClick={signout}
                >
                  Logout
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </Aside>
      <main className="flex-1 h-full bg-[#fafafa] px-7 py-10">
        <div className="bg-white w-full h-full rounded-lg p-6">
          <Outlet context={[company]} />
        </div>
      </main>
    </div>
  );
};

export default CompanySettings;
