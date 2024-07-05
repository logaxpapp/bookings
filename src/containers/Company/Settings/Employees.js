import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router';
import PropTypes from 'prop-types';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon, PlusIcon } from '@heroicons/react/24/outline';
import css from '../Employees/style.module.css';
import {
  createEmployeeAsync,
  removeEmployeeAsync,
  selectEmployees,
  selectEmplyeePermissions,
  selectPermissions,
  updateEmployeeAsync,
} from '../../../redux/companySlice';
import { colors, paths, SvgButton } from '../../../components/svg';
import GridPanel from '../../../components/GridPanel';
import { matchesEmail } from '../../../components/TextBox';
import LoadingButton from '../../../components/LoadingButton';
import { classNames, notification } from '../../../utils';
import EmptyListPanel from '../../../components/EmptyListPanel';
import Modal from '../../../components/Modal';
import av from '../../../assets/images/av.png';

const DELETE = 'delete';
const EMAIL = 'email';
const FIRSTNAME = 'firstname';
const LASTNAME = 'lastname';
const PASSWORD = 'password';
const NEW = 'new';
const UPDATE = 'update';

const employeeProps = PropTypes.shape({
  id: PropTypes.number,
  firstname: PropTypes.string,
  lastname: PropTypes.string,
  email: PropTypes.string,
});

const EmployeeForm = ({ busy, employee, onConfirm }) => {
  const [fields, setFields] = useState({
    [FIRSTNAME]: '',
    [LASTNAME]: '',
    [EMAIL]: '',
    [PASSWORD]: '',
  });

  const [errors, setErrors] = useState({
    [FIRSTNAME]: '',
    [LASTNAME]: '',
    [EMAIL]: '',
    [PASSWORD]: '',
  });

  useEffect(() => {
    if (employee) {
      setFields((fields) => ({
        ...fields,
        firstname: employee.firstname,
        lastname: employee.lastname,
      }));
    }
  }, []);

  const handleValueChange = ({ target: { name, value } }) => {
    setFields((fields) => ({ ...fields, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    const data = {};

    if (employee) {
      if (!(fields.firstname && fields.firstname.length >= 2)) {
        errors.firstname = 'Firstname MUST be at least 2 characters!';
      } else if (fields.firstname !== employee.firstname) {
        data.firstname = fields.firstname;
      }
      if (!(fields.lastname && fields.lastname.length >= 2)) {
        errors.lastname = 'Lastname MUST be at least 2 characters!';
      } else if (fields.lastname !== employee.lastname) {
        data.lastname = fields.lastname;
      }
    } else {
      if (!(fields.firstname && fields.firstname.length >= 2)) {
        errors.firstname = 'Firstname MUST be at least 2 characters!';
      } else {
        data.firstname = fields.firstname;
      }
      if (!(fields.lastname && fields.lastname.length >= 2)) {
        errors.lastname = 'Lastname MUST be at least 2 characters!';
      } else {
        data.lastname = fields.lastname;
      }
      if (!matchesEmail(fields.email)) {
        errors.email = 'Invalid Email Address!';
      } else {
        data.email = fields.email;
      }
      if (!(fields.password && fields.password.length >= 6)) {
        errors.password = 'Weak password!';
      } else {
        data.password = fields.password;
      }
    }

    if (Object.keys(errors).length) {
      setErrors(errors);
      return;
    }

    if (employee && !Object.keys(data).length) {
      notification.showInfo('You have NOT made any changes!');
      return;
    }
    onConfirm(data);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto py-6 px-8">
      <section className="w-full">
        <h1 className="border-dotted border-b border-[#ccc] m-0 pb-4 font-bold text-lg">
          {`${employee ? 'Update' : 'New'} Employee`}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-5">
          <label htmlFor={FIRSTNAME} className="bold-select-wrap">
            <span className="label">Firstname</span>
            <div className="bold-select">
              <input
                type="text"
                name={FIRSTNAME}
                id={FIRSTNAME}
                value={fields.firstname}
                className="text-input"
                onChange={handleValueChange}
              />
            </div>
            {errors.firstname ? <span className="input-error">{errors.firstname}</span> : null}
          </label>
          <label htmlFor={LASTNAME} className="bold-select-wrap">
            <span className="label">Lastname</span>
            <div className="bold-select">
              <input
                type="text"
                name={LASTNAME}
                id={LASTNAME}
                value={fields.lastname}
                className="text-input"
                onChange={handleValueChange}
              />
            </div>
            {errors.lastname ? <span className="input-error">{errors.lastname}</span> : null}
          </label>
          {employee ? null : (
            <>
              <label htmlFor={EMAIL} className="bold-select-wrap">
                <span className="label">Email</span>
                <div className="bold-select">
                  <input
                    type="email"
                    name={EMAIL}
                    id={EMAIL}
                    value={fields.email}
                    className="text-input"
                    onChange={handleValueChange}
                  />
                </div>
                {errors.email ? <span className="input-error">{errors.email}</span> : null}
              </label>
              <label htmlFor={PASSWORD} className="bold-select-wrap">
                <span className="label">Password</span>
                <div className="bold-select">
                  <input
                    type="password"
                    name={PASSWORD}
                    id={PASSWORD}
                    value={fields.password}
                    className="text-input"
                    onChange={handleValueChange}
                  />
                </div>
                {errors.password ? <span className="input-error">{errors.password}</span> : null}
              </label>
            </>
          )}
          <LoadingButton
            type="submit"
            label={employee ? 'Update' : 'Save'}
            loading={busy}
            styles={{ marginTop: 12, fontSize: '0.9rem' }}
          />
        </form>
      </section>
    </div>
  );
};

EmployeeForm.propTypes = {
  employee: employeeProps,
  onConfirm: PropTypes.func.isRequired,
  busy: PropTypes.bool,
};

EmployeeForm.defaultProps = {
  employee: null,
  busy: false,
};

const EmployeeCard = ({
  employee,
  isAdmin,
  onRequestEdit,
  onRequestDelete,
}) => {
  const handleClick = ({ target: { name } }) => {
    if (name === DELETE) {
      onRequestDelete(employee);
    } else if (name === UPDATE) {
      onRequestEdit(employee);
    }
  };

  return (
    <section className={`card ${css.card}`} style={{ maxWidth: 300 }}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center flex-nowrap gap-2">
          <span className="font-semibold text-base text-[#001c39] w-20">Firstname</span>
          <span className="ellipsis font-normal text-base text-[#5c5c5c] flex-1" title={employee.firstname}>
            {employee.firstname}
          </span>
        </div>
        <div className="flex items-center flex-nowrap gap-2">
          <span className="font-semibold text-base text-[#001c39] w-20">Lastname</span>
          <span className="ellipsis font-normal text-base text-[#5c5c5c] flex-1" title={employee.lastname}>
            {employee.lastname}
          </span>
        </div>
        <div className="flex items-center flex-nowrap gap-2">
          <span className="font-semibold text-base text-[#001c39] w-20">Email</span>
          <span className="ellipsis font-normal text-base text-[#5c5c5c] flex-1" title={employee.email}>
            {employee.email}
          </span>
        </div>
      </div>
      <div className="border-t border-[#c6d8e0] pt-3 flex justify-between items-center">
        <img
          aria-hidden="true"
          alt="user"
          src={av}
          className="w-6 h-6 rounded-full"
        />
        {isAdmin ? (
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button>
                <EllipsisVerticalIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
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
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        name={UPDATE}
                        className={classNames(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block w-full px-4 py-2 text-left text-lg',
                        )}
                        onClick={handleClick}
                      >
                        Edit
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        name={DELETE}
                        className={classNames(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block w-full px-4 py-2 text-left text-lg',
                        )}
                        onClick={handleClick}
                      >
                        Delete
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        ) : null}
      </div>
    </section>
  );
};

EmployeeCard.propTypes = {
  employee: employeeProps.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onRequestEdit: PropTypes.func.isRequired,
  onRequestDelete: PropTypes.func.isRequired,
};

const EmployeeRow = ({
  employee,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const handleClick = useCallback(({ target: { name } }) => {
    if (name === DELETE) {
      onDelete(employee);
    } else if (name === UPDATE) {
      onEdit(employee);
    }
  }, []);

  return (
    <tr>
      <td>{employee.firstname}</td>
      <td>{employee.lastname}</td>
      <td>{employee.email}</td>
      {isAdmin ? (
        <>
          <td aria-label="edit" className="control">
            <SvgButton
              type="button"
              name={UPDATE}
              path={paths.pencil}
              title="Edit"
              onClick={handleClick}
              sm
            />
          </td>
          <td aria-label="edit" className="control">
            <SvgButton
              type="button"
              name={DELETE}
              path={paths.delete}
              title="Delete"
              color={colors.delete}
              onClick={handleClick}
              sm
            />
          </td>
        </>
      ) : null}
    </tr>
  );
};

EmployeeRow.propTypes = {
  employee: employeeProps.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const Employees = () => {
  const [formModal, setFormModal] = useState({ busy: false, isOpen: false, employee: null });
  const [deleteModal, setDeleteModal] = useState({ busy: false, isOpen: false, employee: null });
  const employees = useSelector(selectEmployees);
  const permissions = useSelector(selectPermissions);
  const employeePermissions = useSelector(selectEmplyeePermissions);
  const canAddEmployee = useMemo(() => {
    if (!employeePermissions.isAdmin) {
      return false;
    }

    return permissions.numberOfEmployees && employees.length < permissions.numberOfEmployees;
  }, [employees.length, permissions, employeePermissions.isAdmin]);
  const [company] = useOutletContext();
  const dispatch = useDispatch();

  const handleClick = ({ target: { name } }) => {
    if (name === NEW) {
      setFormModal({ isOpen: true, busy: false, employee: null });
    }
  };

  const requestEdit = (employee) => setFormModal({ busy: false, isOpen: true, employee });

  const requestDelete = (employee) => setDeleteModal({ busy: false, isOpen: true, employee });

  const createOrUpdate = (data) => {
    setFormModal((modal) => ({ ...modal, busy: true }));

    const modal = { busy: false };

    if (formModal.employee) {
      dispatch(updateEmployeeAsync(formModal.employee.id, data, (err) => {
        if (!err) {
          modal.isOpen = false;
          modal.employee = null;
        }

        setFormModal(modal);
      }));
    } else {
      dispatch(createEmployeeAsync(data, (err) => {
        if (!err) {
          modal.isOpen = false;
          modal.employee = null;
        }

        setFormModal(modal);
      }));
    }
  };

  const deleteEmployee = () => {
    if (!deleteModal.employee) {
      return;
    }

    if (deleteModal.employee.email === company.email) {
      notification.showError('You CANNOT delete this employee because they are the companies super admin. Please contact support@logaxp.com');
      setDeleteModal({ employee: null, busy: false, isOpen: false });
      return;
    }

    setDeleteModal((modal) => ({ ...modal, busy: true }));

    dispatch(removeEmployeeAsync(deleteModal.employee.id, (err) => {
      const modal = { busy: false };

      if (!err) {
        modal.isOpen = false;
        modal.employee = null;
      }

      setDeleteModal(modal);
    }));
  };

  /* eslint-disable no-nested-ternary */
  return (
    <div className="h-full overflow-y-auto" id="company-employees-panel">
      <section className={css.main}>
        <header className="page-header">
          <h1 className="page-heading">Employees</h1>
          {canAddEmployee ? (
            <button
              type="button"
              className="btn"
              name={NEW}
              onClick={handleClick}
            >
              <div className="flex items-center gap-2 pointer-events-none">
                <PlusIcon className="w-[18px] h-[18px]" stroke="#fff" />
                <span>New Employee</span>
              </div>
            </button>
          ) : null}
        </header>
        {employees.length ? (
          <div className="card-wrap">
            <GridPanel minimumChildWidth={300}>
              {employees.map((emp) => (
                <div key={emp.id} className="card-center">
                  <EmployeeCard
                    employee={emp}
                    isAdmin={employeePermissions.isAdmin}
                    onRequestDelete={requestDelete}
                    onRequestEdit={requestEdit}
                  />
                </div>
              ))}
            </GridPanel>
          </div>
        ) : (
          <EmptyListPanel text="No employees found" />
        )}
      </section>
      <Modal
        isOpen={formModal.isOpen || formModal.busy}
        parentSelector={() => document.querySelector('#company-employees-panel')}
        onRequestClose={() => {
          if (!formModal.busy) {
            setFormModal({ busy: false, isOpen: false, employee: null });
          }
        }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <EmployeeForm
          busy={formModal.busy}
          employee={formModal.employee}
          onConfirm={createOrUpdate}
        />
      </Modal>
      <Modal
        isOpen={deleteModal.isOpen || deleteModal.busy}
        parentSelector={() => document.querySelector('#company-employees-panel')}
        onRequestClose={() => {
          if (!deleteModal.busy) {
            setDeleteModal({ busy: false, isOpen: false, employee: null });
          }
        }}
        style={{ content: { maxWidth: 440 } }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <section className="flex flex-col gap-8 py-4 px-8">
          <div className="flex flex-col gap-3">
            <h1 className="font-medium text-xl text-[#011c39] m-0">
              Employee will be permanently deleted!
            </h1>
            <p className="m-0 font-normal text-lg text-[#5c5c5c]">
              Do you wish to continue?
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={deleteEmployee}
              className="py-4 px-12 rounded-[10px] transition-transform hover:scale-105 bg-[#cb1212] text-white"
              disabled={deleteModal.busy}
            >
              Confirm
            </button>
          </div>
        </section>
      </Modal>
    </div>
  );
  /* eslint-enable no-nested-ternary */
};

export default Employees;
