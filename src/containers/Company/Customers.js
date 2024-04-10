import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { loadCountriesAsync, selectCountries } from '../../redux/countriesSlice';
import EmptyListPanel from '../../components/EmptyListPanel';
import plus from '../../assets/images/plus.svg';
import importIcon from '../../assets/images/import.svg';
import copyAddIcon from '../../assets/images/copy-add.svg';
import googleIcon from '../../assets/images/google.svg';
import Modal from '../../components/Modal';
import Aside, { Heading, Heading1 } from '../Aside';
import GridPanel from '../../components/GridPanel';
import { Input, matchesEmail, matchesPhoneNumber } from '../../components/TextBox';
import {
  createCustomerAsync,
  removeCustomerAsync,
  selectCustomers,
  updateCustomerAsync,
} from '../../redux/companySlice';
import emailIcon from '../../assets/images/email.svg';
import phoneIcon from '../../assets/images/phone.svg';
import addressicon from '../../assets/images/marker.svg';
import { addressText, classNames } from '../../utils';

const ADDRESS_LINE1 = 'line1';
const ADDRESS_LINE2 = 'line2';
const CITY = 'city';
const COUNTRY = 'country';
const EMAIL = 'email';
const FIRSTNAME = 'firstname';
const IMPORT_CSV = 'import_csv';
const IMPORT_GOOGLE_CONTACT = 'import_google_contact';
const LASTNAME = 'lastname';
const PHONE_NUMBER = 'phone_number';
const STATE = 'state';
const ZIP_CODE = 'zip_code';

const customers = [];

const customerProps = PropTypes.shape({
  id: PropTypes.number,
  firstname: PropTypes.string,
  lastname: PropTypes.string,
  email: PropTypes.string,
  phoneNumber: PropTypes.string,
  address: PropTypes.shape({
    id: PropTypes.number,
    line1: PropTypes.string,
    line2: PropTypes.string,
    zipCode: PropTypes.number,
    city: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      state: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        country: PropTypes.shape({
          id: PropTypes.number,
          name: PropTypes.string,
        }),
      }),
    }),
  }),
});

const customerFields = [
  'firstname', 'lastname', 'email', 'phone_number',
  'country', 'state', 'city', 'address_line1',
  'address_line2', 'zip_code',
];

const CustomerEditor = ({
  busy,
  customer,
  onClose,
  setBusy,
}) => {
  const [fields, setFields] = useState({
    [FIRSTNAME]: '',
    [LASTNAME]: '',
    [EMAIL]: '',
    [PHONE_NUMBER]: '',
    [ADDRESS_LINE1]: '',
    [ADDRESS_LINE2]: '',
    [ZIP_CODE]: '',
  });
  const [errors, setErrors] = useState({
    [FIRSTNAME]: '',
    [LASTNAME]: '',
    [EMAIL]: '',
    [PHONE_NUMBER]: '',
    [ADDRESS_LINE1]: '',
    [ZIP_CODE]: '',
    [CITY]: '',
  });
  const countries = useSelector(selectCountries);
  const [country, setCountry] = useState(null);
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const dispatch = useDispatch();
  const loadedRef = useRef(false);

  const selectState = useCallback((state) => {
    setState(state);

    if (state) {
      setCity(state.cities[0]);
    } else {
      setCity(null);
    }
  }, []);

  const selectCountry = useCallback((country) => {
    setCountry(country);
    if (country) {
      selectState(country.states[0]);
    } else {
      setState(null);
      setCity(null);
    }
  }, []);

  useEffect(() => {
    if (countries) {
      if (!loadedRef.current) {
        loadedRef.current = true;
        if (customer) {
          setFields({
            line1: customer.address?.line1 || '',
            line2: customer.address?.line2 || '',
            zip_code: customer.address?.zipCode || '',
            firstname: customer.firstname || '',
            lastname: customer.lastname || '',
            email: customer.email || '',
            phone_number: customer.phoneNumber || '',
          });
        }

        if (customer?.address) {
          let id = customer.address.city?.state?.country?.id;
          if (id) {
            const country = countries.find((c) => c.id === id);
            if (country) {
              setCountry(country);
              id = customer.address.city.state.id;
              if (id) {
                const state = country.states.find((s) => s.id === id);

                if (state) {
                  setState(state);
                  id = customer.address.city.id;

                  if (id) {
                    const city = state.cities.find((c) => c.id === id);
                    if (city) {
                      setCity(city);
                    }
                  }
                }
              }

              return;
            }
          }
        }

        selectCountry(countries[0]);
      }
    } else {
      dispatch(loadCountriesAsync());
    }
  }, [countries, customer]);

  const handleSelectChange = ({ target: { name, value } }) => {
    const selectedId = Number.parseInt(value, 10);

    if (name === COUNTRY) {
      selectCountry(countries.find(({ id }) => id === selectedId));
    } else if (name === STATE) {
      selectState(country && country.states.find(({ id }) => id === selectedId));
    } else if (name === CITY) {
      setCity(state && state.cities.find(({ id }) => id === selectedId));
    }
  };

  const handleFieldChange = ({ target: { name, value } }) => setFields(
    (fields) => ({ ...fields, [name]: value }),
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};

    if (!fields.firstname || fields.firstname.length < 2) {
      errors[FIRSTNAME] = 'Firstname MUST be at least 2 characters!';
    }

    if (!fields.lastname || fields.lastname.length < 2) {
      errors[LASTNAME] = 'Lastname MUST be at least 2 characters!';
    }

    if (!matchesEmail(fields.email)) {
      errors[EMAIL] = 'Invalid Email Address!';
    }

    if (!matchesPhoneNumber(fields.phone_number)) {
      errors[PHONE_NUMBER] = 'Invalid Phone Number!';
    }

    if (!fields.line1) {
      errors[ADDRESS_LINE1] = 'This field is required!';
    }

    if (!city) {
      errors[CITY] = 'Please select a city!';
    }

    if (!fields[ZIP_CODE]) {
      errors[ZIP_CODE] = 'This field is required!';
    }

    setErrors(errors);

    if (Object.keys(errors).length) {
      return;
    }

    const data = { ...fields, city_id: city.id };
    setBusy(true);

    if (customer?.id) {
      dispatch(updateCustomerAsync(customer.id, data, (err) => {
        setBusy(false);
        if (!err && onClose) {
          onClose();
        }
      }));
    } else {
      dispatch(createCustomerAsync(data, (err) => {
        setBusy(false);
        if (!err && onClose) {
          onClose();
        }
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="modal-bold-body max-h-[80vh] overflow-auto">
      <h1 className="m-0 text-lg font-semibold">
        Add Customer
      </h1>
      <Input
        type="text"
        name={FIRSTNAME}
        value={fields[FIRSTNAME]}
        label="Firstname"
        onChange={handleFieldChange}
        error={errors.firstname}
      />
      <Input
        type="text"
        name={LASTNAME}
        value={fields[LASTNAME]}
        label="Lastname"
        onChange={handleFieldChange}
        error={errors.lastname}
      />
      <Input
        type="email"
        name={EMAIL}
        value={fields[EMAIL]}
        label="Email"
        onChange={handleFieldChange}
        error={errors.email}
      />
      <Input
        type="text"
        name={PHONE_NUMBER}
        value={fields[PHONE_NUMBER]}
        label="Phone Number"
        onChange={handleFieldChange}
        error={errors.phone_number}
      />
      <label htmlFor={COUNTRY} className="bold-select-wrap">
        <span className="label">Select Country</span>
        <div className="bold-select caret">
          <select
            name={COUNTRY}
            value={(country && country.id) || ''}
            onChange={handleSelectChange}
          >
            <option value="" disabled>-- Select Country --</option>
            {countries ? countries.map((country) => (
              <option value={country.id} key={country.id}>{country.name}</option>
            )) : null}
          </select>
        </div>
      </label>
      <label htmlFor={STATE} className="bold-select-wrap">
        <span className="label">Select State</span>
        <div className="bold-select caret">
          <select
            name={STATE}
            value={(state && state.id) || ''}
            onChange={handleSelectChange}
          >
            <option value="" disabled>-- Select State --</option>
            {country ? country.states.map((state) => (
              <option value={state.id} key={state.id}>{state.name}</option>
            )) : null}
          </select>
        </div>
      </label>
      <label htmlFor={CITY} className="bold-select-wrap">
        <span className="label">Select City</span>
        <div className="bold-select caret" style={errors.city ? { borderColor: '#c51306' } : {}}>
          <select
            name={CITY}
            value={(city && city.id) || ''}
            onChange={handleSelectChange}
          >
            <option value="" disabled>-- Select City --</option>
            {state ? state.cities.map((city) => (
              <option value={city.id} key={city.id}>{city.name}</option>
            )) : null}
          </select>
        </div>
        {errors.city ? <span className="input-error">{errors.city}</span> : null}
      </label>
      <Input
        type="text"
        name={ADDRESS_LINE1}
        value={fields[ADDRESS_LINE1]}
        label="Address Line 1"
        onChange={handleFieldChange}
        error={errors.line1}
      />
      <Input
        type="text"
        name={ADDRESS_LINE2}
        value={fields[ADDRESS_LINE2]}
        label="Address Line 2"
        onChange={handleFieldChange}
      />
      <Input
        type="text"
        name={ZIP_CODE}
        value={fields[ZIP_CODE]}
        label="Zip Code"
        onChange={handleFieldChange}
        error={errors.zip_code}
      />
      <div className="flex items-center justify-center">
        <button
          type="submit"
          className={`btn ${busy ? 'busy' : ''}`}
        >
          {customer?.id ? 'Edit Customer' : 'Add Customer'}
        </button>
      </div>
    </form>
  );
};

CustomerEditor.propTypes = {
  busy: PropTypes.bool,
  customer: customerProps,
  onClose: PropTypes.func,
  setBusy: PropTypes.func.isRequired,
};

CustomerEditor.defaultProps = {
  busy: false,
  customer: null,
  onClose: null,
};

const ImportCustomer = () => {
  const fileInputRef = useRef(null);

  const handleClick = ({ target: { name } }) => {
    if (name === IMPORT_CSV) {
      fileInputRef.current.click();
    } else if (name === IMPORT_GOOGLE_CONTACT) {
      //  TODO:
    }
  };

  const handleFileChange = ({ target: { files } }) => {
    const file = files && files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const csv = reader.result;
        const values = csv.split(',');
        const customer = customerFields.reduce((memo, current, idx) => (
          { ...memo, [current]: values[idx] }
        ), {});
        customers.push(customer);
      };

      reader.readAsText(file, 'utf8');
    }
  };

  return (
    <section className="flex flex-col items-center p-12">
      <Heading1>Import Customer</Heading1>
      <p className="m-0 pt-3 pb-5">
        Choose how you want to import your contact
      </p>
      <div className="flex flex-col gap-[10px] w-96 pb-16 relative">
        <input type="file" ref={fileInputRef} className="clip" onChange={handleFileChange} />
        <button
          type="button"
          name={IMPORT_CSV}
          onClick={handleClick}
          className="flex items-center gap-2 bg-[#f8fafc] font-medium text-sm text-[#5c5c5c] w-full p-[10px] text-left rounded-lg"
        >
          <span
            aria-hidden="true"
            className="h-5 pointer-events-none"
            style={{
              backgroundImage: `url(${copyAddIcon})`,
              flex: '0 0 20px',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <span className="pointer-events-none">
            CSV File
          </span>
        </button>
        <button
          type="button"
          name={IMPORT_GOOGLE_CONTACT}
          onClick={handleClick}
          className="flex items-center gap-2 bg-[#f8fafc] font-medium text-sm text-[#5c5c5c] w-full p-[10px] text-left rounded-lg"
        >
          <span
            aria-hidden="true"
            className="h-5"
            style={{
              backgroundImage: `url(${googleIcon})`,
              flex: '0 0 20px',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <span className="pointer-events-none">
            Google contacts
          </span>
        </button>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          className="py-4 px-12 rounded-[10px] transition-transform hover:scale-105 bg-[#011c39] text-white"
        >
          Continue
        </button>
      </div>
    </section>
  );
};

const ModalControls = ({
  setEditorModal,
  setImportModal,
  vertical,
}) => (
  <div className={`flex ${vertical ? 'flex-col gap-6 py-6 pr-6' : 'gap-4 items-center'}`}>
    <button
      type="button"
      onClick={() => setEditorModal({ busy: false, isOpen: true })}
      className="py-4 px-6 rounded-[10px] transition-transform hover:scale-105 bg-[#011c39] text-white flex items-center gap-[6px]"
    >
      <span
        aria-hidden="true"
        className="w-5 h-5 bg-white"
        style={{ mask: `url(${plus})`, flex: '0 0 20px' }}
      />
      <span>Add customer</span>
    </button>
    <button
      type="button"
      onClick={() => setImportModal({ busy: false, isOpen: true })}
      className="py-4 px-6 rounded-[10px] transition-transform hover:scale-105 bg-[#e9ebf8] text-[#011c39] flex items-center gap-[6px]"
    >
      <span
        aria-hidden="true"
        className="w-5 h-5 bg-white flex-[0 0 20px]"
        style={{ backgroundImage: `url(${importIcon})` }}
      />
      <span>Import customer</span>
    </button>
  </div>
);

ModalControls.propTypes = {
  setEditorModal: PropTypes.func.isRequired,
  setImportModal: PropTypes.func.isRequired,
  vertical: PropTypes.bool,
};

ModalControls.defaultProps = {
  vertical: false,
};

const CustomerFieldRow = ({ text, icon }) => (
  <div className="flex items-center gap-3">
    <span
      aria-hidden="true"
      className="w-[18px] h-[18px] bg-[#5c5c5c]"
      style={{
        maskRepeat: 'no-repeat',
        maskSize: '100% 100%',
        maskImage: `url(${icon})`,
      }}
    />
    <span className="flex-1 whitespace-break-spaces">{text}</span>
  </div>
);

CustomerFieldRow.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
};

const CustomerCard = ({
  customer,
  setEditModal,
  setDeleteModal,
}) => {
  const address = useMemo(() => addressText(customer.address), [customer]);

  return (
    <section
      className="px-6 py-5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] relative"
    >
      <h1 className="font-semibold text-xl text-[#011c39]">
        {`${customer.firstname} ${customer.lastname}`}
      </h1>
      <div className="flex flex-col gap-5 text-[#011c39]">
        <CustomerFieldRow text={customer.email} icon={emailIcon} />
        <CustomerFieldRow text={customer.phoneNumber} icon={phoneIcon} />
        <CustomerFieldRow text={address} icon={addressicon} />
      </div>
      <Menu as="div" className="absolute top-1 right-1">
        <div>
          <Menu.Button className="inline-flex gap-4 items-center">
            <EllipsisVerticalIcon className="w-6 h-6 text-[#5c5c5c]" />
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
            className="absolute right-0 z-10 mt-2 w-min origin-top-right
            rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'flex gap-2 items-center py-[10px] pl-10 pr-20 w-full',
                    )}
                    onClick={() => setEditModal({ customer, busy: false, isOpen: true })}
                  >
                    <PencilIcon className="w-4 h-4" stroke="#545454" type="outline" />
                    <span className="text-sm font-[#545454] whitespace-nowrap">
                      Edit Customer
                    </span>
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'flex gap-2 items-center py-[10px] pl-10 pr-20 w-full',
                    )}
                    onClick={() => setDeleteModal({ customer, isOpen: true, busy: false })}
                  >
                    <TrashIcon className="w-4 h-4" stroke="#b61818" type="outline" />
                    <span className="text-sm text-[#b61818] whitespace-nowrap">
                      Delete Customer
                    </span>
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </section>
  );
};

CustomerCard.propTypes = {
  customer: customerProps.isRequired,
  setEditModal: PropTypes.func.isRequired,
  setDeleteModal: PropTypes.func.isRequired,
};

const Customers = () => {
  const [deleteModal, setDeleteModal] = useState({
    busy: false,
    customer: null,
    isOpen: false,
  });
  const [editorModal, setEditorModal] = useState({
    busy: false,
    customer: null,
    isOpen: false,
  });
  const [importModal, setImportModal] = useState({
    busy: false,
    isOpen: false,
  });
  const customers = useSelector(selectCustomers);
  const dispatch = useDispatch();

  const handleDelete = () => {
    const id = deleteModal.customer?.id;

    if (!id) {
      return;
    }

    setDeleteModal((modal) => ({ ...modal, busy: true }));

    dispatch(removeCustomerAsync(id, (err) => setDeleteModal((modal) => ({
      busy: false,
      isOpen: !!err,
      customer: err ? modal.customer : null,
    }))));
  };

  return (
    <section
      className="h-full w-full overflow-y-auto flex-1 flex"
      id="company-settings-customer-panel"
    >
      <Aside>
        <Heading>Customers</Heading>
        {customers?.length ? (
          <ModalControls setEditorModal={setEditorModal} setImportModal={setImportModal} vertical />
        ) : null}
      </Aside>
      {customers.length ? (
        <GridPanel minimumChildWidth={280}>
          {customers.map((customer) => (
            <div key={customer.email} className="p-3">
              <CustomerCard
                customer={customer}
                setEditModal={setEditorModal}
                setDeleteModal={setDeleteModal}
              />
            </div>
          ))}
        </GridPanel>
      ) : (
        <div className="w-full flex justify-center">
          <EmptyListPanel text="No customers to display">
            <ModalControls setEditorModal={setEditorModal} setImportModal={setImportModal} />
          </EmptyListPanel>
        </div>
      )}
      <Modal
        isOpen={editorModal.isOpen || editorModal.busy}
        parentSelector={() => document.querySelector('#company-settings-customer-panel')}
        onRequestClose={() => {
          if (!editorModal.busy) {
            setEditorModal((modal) => ({ ...modal, isOpen: false }));
          }
        }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <CustomerEditor
          busy={editorModal.busy}
          customer={editorModal.customer}
          onClose={() => setEditorModal({ busy: false, customer: null, isOpen: false })}
          setBusy={(busy) => setEditorModal((modal) => ({ ...modal, busy }))}
        />
      </Modal>
      <Modal
        isOpen={deleteModal.isOpen || deleteModal.busy}
        parentSelector={() => document.querySelector('#company-settings-customer-panel')}
        onRequestClose={() => {
          if (!deleteModal.busy) {
            setDeleteModal({ isOpen: false, busy: false, customer: null });
          }
        }}
        style={{ content: { maxWidth: 400 } }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <div className="py-5 px-8">
          <p className="m-0 px-4 flex flex-col gap-3">
            <span className="font-medium text-lg">
              {`The customer ${deleteModal.customer?.fullname} will be permanently deleted!`}
            </span>
            <span className="text-lg font-semibold text-center">
              Do yo wish to continue?
            </span>
          </p>
          <div className="pt-6 px-4 flex items-center justify-end">
            <button
              type="button"
              className={`btn danger ${deleteModal.busy ? 'busy' : ''}`}
              onClick={handleDelete}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={importModal.isOpen || importModal.busy}
        parentSelector={() => document.querySelector('#company-settings-customer-panel')}
        onRequestClose={() => {
          if (!importModal.busy) {
            setImportModal((modal) => ({ ...modal, isOpen: false }));
          }
        }}
        style={{ content: { width: 'max-content' } }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <ImportCustomer />
      </Modal>
    </section>
  );
};

export default Customers;
