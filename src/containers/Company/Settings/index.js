import {
  useCallback, useEffect, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useOutletContext } from 'react-router';
import { Link, Navigate, Outlet } from 'react-router-dom';
import css from './styles.module.css';
import { FieldEditor } from '../../../components/TextBox';
import { selectPermissions, updateCompanyAsync } from '../../../redux/companySlice';
import routes from '../../../routing/routes';
import { capitalize } from '../../../utils';
import { Ring } from '../../../components/LoadingButton';

const ABOUT_US = 'about_us';
const SAVE = 'save';

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

const CompanySettings = () => {
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

export default CompanySettings;
