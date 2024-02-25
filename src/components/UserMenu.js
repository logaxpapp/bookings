import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

import av from '../assets/images/av.png';
import { selectEmployee, logout as logoutEmployee } from '../redux/companySlice';
import { selectUser, logout as logoutUser } from '../redux/userSlice';
import {
  EmployeePasswordEditorDialog,
  UserPasswordEditorDialog,
} from '../containers/Authentication/PasswordEditor';
import routes from '../routing/routes';

const classNames = (...classes) => classes.filter(Boolean).join(' ');

const UserMenuComponent = ({
  dashboardPath,
  name,
  onLogout,
  PasswordEditor,
}) => {
  const [isPasswordEditorOpen, setPasswordEditorOpen] = useState(false);

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <div className="flex items-center gap-1">
              <img src={av} alt="user" className="w-6 h-6 rounded-full" />
              <span>{name}</span>
            </div>
            <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
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
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {window.location.pathname === dashboardPath ? null : (
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block w-full px-4 py-2 text-left text-lg',
                      )}
                      to={dashboardPath}
                    >
                      My Dashboard
                    </Link>
                  )}
                </Menu.Item>
              )}
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block w-full px-4 py-2 text-left text-lg',
                    )}
                    onClick={() => setPasswordEditorOpen(true)}
                  >
                    Change Password
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block w-full px-4 py-2 text-left text-lg',
                    )}
                    onClick={onLogout}
                  >
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      <PasswordEditor
        isOpen={isPasswordEditorOpen}
        onClose={() => setPasswordEditorOpen(false)}
      />
    </>
  );
};

UserMenuComponent.propTypes = {
  name: PropTypes.string.isRequired,
  onLogout: PropTypes.func.isRequired,
  dashboardPath: PropTypes.string.isRequired,
  PasswordEditor: PropTypes.elementType.isRequired,
};

const UserMenu = ({ color }) => {
  const user = useSelector(selectUser);
  const employee = useSelector(selectEmployee);
  const [state, setState] = useState({
    isLoggedIn: false,
    name: '',
    isProvider: false,
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const state = { isLoggedIn: false, name: '', isProvider: false };

    if (employee) {
      state.isLoggedIn = true;
      state.name = employee.firstname;
      state.isProvider = true;
    } else if (user) {
      state.isLoggedIn = true;
      state.name = user.firstname;
      state.isProvider = false;
    }

    setState(state);
  }, [employee, user]);

  if (!state.isLoggedIn) {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <title>globe</title>
        <path fill={color} d="M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A1,1 0 0,0 14,12H8V10H10A1,1 0 0,0 11,9V7H13A2,2 0 0,0 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.05,19.44 4,16.08 4,12C4,11.38 4.08,10.78 4.21,10.21L9,15V16A2,2 0 0,0 11,18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
      </svg>
    );
  }

  const logout = () => {
    if (state.isProvider) {
      dispatch(logoutEmployee());
    } else {
      dispatch(logoutUser());
    }

    navigate(routes.home);
  };

  return (
    <UserMenuComponent
      name={state.name}
      onLogout={logout}
      dashboardPath={
        state.isProvider
          ? routes.company.absolute.dashboard
          : routes.user.dashboard.absolute.home
      }
      PasswordEditor={
        state.isProvider
          ? EmployeePasswordEditorDialog
          : UserPasswordEditorDialog
      }
    />
  );
};

UserMenu.propTypes = {
  color: PropTypes.string,
};

UserMenu.defaultProps = {
  color: '#011c39',
};

export default UserMenu;
