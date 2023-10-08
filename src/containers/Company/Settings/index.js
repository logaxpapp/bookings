import {
  useCallback,
} from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useOutletContext } from 'react-router';
import { Link, Outlet } from 'react-router-dom';
import css from './styles.module.css';
import { FieldEditor } from '../../../components/TextBox';
import { updateCompanyAsync } from '../../../redux/companySlice';
import routes from '../../../routing/routes';
import { capitalize } from '../../../utils';

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
  const dispatch = useDispatch();

  const handleUpdate = useCallback((name, value, callback) => (
    dispatch(updateCompanyAsync({ [name]: value }, callback))
  ), []);

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
      </div>
    </section>
  );
};

const CompanySettings = () => {
  const [company] = useOutletContext();
  const { pathname } = useLocation();

  return (
    <main className={css.main}>
      <nav className={css.nav}>
        {menus.map((menu) => (
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
