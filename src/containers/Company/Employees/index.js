import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import css from './style.module.css';
import { NewButton } from '../../../components/Buttons';
import { Loader } from '../../../components/LoadingSpinner';
import {
  createEmployeeAsync,
  removeEmployeeAsync,
  selectEmployees,
  selectPermissions,
  updateEmployeeAsync,
} from '../../../redux/companySlice';
import { colors, paths, SvgButton } from '../../../components/svg';
import GridPanel from '../../../components/GridPanel';
import { useConfirmDialog, useDialog } from '../../../lib/Dialog';
import SlideDialog from '../../../components/SlideInDialog';
import TextBox, { matchEmail } from '../../../components/TextBox';
import LoadingButton from '../../../components/LoadingButton';
import { useNotification } from '../../../lib/Notification';

const CLOSE = 'close';
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

const EmployeeForm = ({ employee, onConfirm }) => {
  const [isOpen, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
  });
  const notification = useNotification();

  useEffect(() => setOpen(true), []);

  useEffect(() => {
    if (employee) {
      setFirstname(employee.firstname);
      setLastname(employee.lastname);
    }
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE) {
      setOpen(false);
      setTimeout(() => onConfirm(null), 500);
    }
  }, [onConfirm, setOpen]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === FIRSTNAME) {
      setFirstname(value);
    } else if (name === LASTNAME) {
      setLastname(value);
    } else if (name === EMAIL) {
      setEmail(value);
    } else if (name === PASSWORD) {
      setPassword(value);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const errors = {};
    const data = {};

    if (employee) {
      if (!(firstname && firstname.length >= 2)) {
        errors.firstname = 'Firstname MUST be at least 2 characters!';
      } else if (firstname !== employee.firstname) {
        data.firstname = firstname;
      }
      if (!(lastname && lastname.length >= 2)) {
        errors.lastname = 'Lastname MUST be at least 2 characters!';
      } else if (lastname !== employee.lastname) {
        data.lastname = lastname;
      }
    } else {
      if (!(firstname && firstname.length >= 2)) {
        errors.firstname = 'Firstname MUST be at least 2 characters!';
      } else {
        data.firstname = firstname;
      }
      if (!(lastname && lastname.length >= 2)) {
        errors.lastname = 'Lastname MUST be at least 2 characters!';
      } else {
        data.lastname = lastname;
      }
      if (!matchEmail(email)) {
        errors.email = 'Invalid Email Address!';
      } else {
        data.email = email;
      }
      if (!(password && password.length >= 6)) {
        errors.password = 'Password MUST be at least 6 characters!';
      } else {
        data.password = password;
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

    setBusy(true);
    onConfirm(data, (err) => {
      setBusy(false);
      if (!err) {
        setOpen(false);
        setTimeout(() => onConfirm(null), 500);
      }
    });
  }, [
    firstname, lastname, email, password, employee,
    onConfirm, setBusy, setErrors,
  ]);

  return (
    <SlideDialog isIn={isOpen}>
      <section className={css.editor}>
        <header className={css.editor_header}>
          <h1 className={css.editor_heading}>
            {`${employee ? 'Update' : 'New'} Employee`}
          </h1>
          {busy ? null : (
            <SvgButton
              type="button"
              name={CLOSE}
              title="Close"
              color={colors.delete}
              path={paths.close}
              onClick={handleClick}
            />
          )}
        </header>
        <form onSubmit={handleSubmit} className={css.editor_form}>
          <TextBox
            type="text"
            id={FIRSTNAME}
            name={FIRSTNAME}
            value={firstname}
            label="Firstname"
            error={errors.firstname}
            style={{ backgroundColor: '#ebeff2' }}
            containerStyle={{ marginBottom: 0 }}
            onChange={handleValueChange}
          />
          <TextBox
            type="text"
            id={LASTNAME}
            name={LASTNAME}
            value={lastname}
            label="Lastname"
            error={errors.lastname}
            style={{ backgroundColor: '#ebeff2' }}
            containerStyle={{ marginBottom: 0 }}
            onChange={handleValueChange}
          />
          {employee ? null : (
            <>
              <TextBox
                type="email"
                id={EMAIL}
                name={EMAIL}
                value={email}
                label="Email"
                error={errors.email}
                style={{ backgroundColor: '#ebeff2' }}
                containerStyle={{ marginBottom: 0 }}
                onChange={handleValueChange}
              />
              <TextBox
                type="password"
                id={PASSWORD}
                name={PASSWORD}
                value={password}
                label="Password"
                error={errors.password}
                style={{ backgroundColor: '#ebeff2' }}
                containerStyle={{ marginBottom: 0 }}
                onChange={handleValueChange}
              />
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
    </SlideDialog>
  );
};

EmployeeForm.propTypes = {
  employee: employeeProps,
  onConfirm: PropTypes.func.isRequired,
};

EmployeeForm.defaultProps = {
  employee: null,
};

const EmployeeCard = ({
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
    <section className={`card ${css.card}`}>
      <div className="card-body">
        <div className="card-row">
          <span className="card-label">Firstname</span>
          <span className="ellipsis card-value" title={employee.firstname}>
            {employee.firstname}
          </span>
        </div>
        <div className="card-row">
          <span className="card-label">Lastname</span>
          <span className="ellipsis card-value" title={employee.lastname}>
            {employee.lastname}
          </span>
        </div>
        <div className="card-row">
          <span className="card-label">Email</span>
          <span className="ellipsis card-value" title={employee.email}>
            {employee.email}
          </span>
        </div>
      </div>
      <div className="card-footer">
        {isAdmin ? (
          <>
            <SvgButton
              type="button"
              name={UPDATE}
              path={paths.pencil}
              title="Edit"
              onClick={handleClick}
              sm
            />
            <SvgButton
              type="button"
              name={DELETE}
              path={paths.delete}
              title="Delete"
              color={colors.delete}
              onClick={handleClick}
              sm
            />
          </>
        ) : null}
      </div>
    </section>
  );
};

EmployeeCard.propTypes = {
  employee: employeeProps.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
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
          <td className="control">
            <SvgButton
              type="button"
              name={UPDATE}
              path={paths.pencil}
              title="Edit"
              onClick={handleClick}
              sm
            />
          </td>
          <td className="control">
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
  const [busy, setBusy] = useState(false);
  const employees = useSelector(selectEmployees);
  const permissions = useSelector(selectPermissions);
  const confirmDialog = useConfirmDialog();
  const dialog = useDialog();
  const dispatch = useDispatch();

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === NEW) {
      let popup;
      const handleConfirm = (data, callback) => {
        if (!data) {
          popup.close();
          return;
        }

        dispatch(createEmployeeAsync(data, callback));
      };

      popup = dialog.show(
        <EmployeeForm onConfirm={handleConfirm} />,
      );
    }
  }, []);

  const updateEmployee = useCallback((employee) => {
    let popup;
    const handleConfirm = (data, callback) => {
      if (!data) {
        popup.close();
        return;
      }

      dispatch(updateEmployeeAsync(employee.id, data, callback));
    };

    popup = dialog.show(
      <EmployeeForm employee={employee} onConfirm={handleConfirm} />,
    );
  }, []);

  const deleteEmployee = useCallback((employee) => {
    confirmDialog.show(
      'Employee will be permanently deleted!',
      'Do you wish to continue?',
      (confirmed) => {
        if (confirmed) {
          setBusy(true);
          dispatch(removeEmployeeAsync(employee.id, () => setBusy(false)));
        }
      },
    );
  }, []);

  /* eslint-disable no-nested-ternary */
  return (
    <main className={css.main}>
      <header className="page-header">
        {permissions.isAdmin ? (
          <NewButton name={NEW} text="New Employee" onClick={handleClick} />
        ) : null}
        <h1 className="page-heading">Employees</h1>
      </header>
      {busy ? (
        <div className="fill-wrapper">
          <Loader type="double_ring">
            <span>Application busy ...</span>
          </Loader>
        </div>
      ) : employees.length ? (
        <>
          <div className={`table-wrap ${css.table_wrap}`}>
            <div className={`table-card ${css.table_card}`}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Firstname</th>
                    <th>Lastname</th>
                    <th>Email</th>
                    <th colSpan={2}>Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <EmployeeRow
                      key={emp.id}
                      employee={emp}
                      isAdmin={permissions.isAdmin}
                      onEdit={updateEmployee}
                      onDelete={deleteEmployee}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={`card-wrap ${css.card_wrap}`}>
            <GridPanel minimumChildWidth={240}>
              {employees.map((emp) => (
                <div key={emp.id} className="card-center">
                  <EmployeeCard
                    employee={emp}
                    isAdmin={permissions.isAdmin}
                    onEdit={updateEmployee}
                    onDelete={deleteEmployee}
                  />
                </div>
              ))}
            </GridPanel>
          </div>
        </>
      ) : (
        <p className="empty-notice">No employees found!</p>
      )}
    </main>
  );
  /* eslint-enable no-nested-ternary */
};

export default Employees;
