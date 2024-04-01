import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { loadCountriesAsync, selectCountries } from '../../../redux/countriesSlice';
import EmptyListPanel from '../../../components/EmptyListPanel';
import plus from '../../../assets/images/plus.svg';
import importIcon from '../../../assets/images/import.svg';
import copyAddIcon from '../../../assets/images/copy-add.svg';
import googleIcon from '../../../assets/images/google.svg';
import Modal from '../../../components/Modal';
import { Heading1 } from '../../Aside';
import GridPanel from '../../../components/GridPanel';

const ADDRESS_LINE1 = 'address_line1';
const ADDRESS_LINE2 = 'address_line2';
const CITY = 'city';
const COUNTRY = 'country';
const EMAIL = 'email';
const FULLNAME = 'fullname';
const IMPORT_CSV = 'import_csv';
const IMPORT_GOOGLE_CONTACT = 'import_google_contact';
const PHONE_NUMBER = 'phone_number';
const STATE = 'state';
const ZIP_CODE = 'zip_code';

const customers = [];

const customerFields = [
  'fullname', 'email', 'phone_number',
  'country', 'state', 'city', 'address_line1',
  'address_line2', 'zip_code',
];

const CustomerEditor = () => {
  const [fields, setFields] = useState({
    [FULLNAME]: '',
    [EMAIL]: '',
    [PHONE_NUMBER]: '',
    [ADDRESS_LINE1]: '',
    [ADDRESS_LINE2]: '',
    [ZIP_CODE]: '',
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
        selectCountry(countries[0]);
      }
    } else {
      dispatch(loadCountriesAsync());
    }
  }, [countries]);

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
  };

  return (
    <form onSubmit={handleSubmit} className="modal-bold-body max-h-[80vh] overflow-auto">
      <h1 className="m-0 text-lg font-semibold">
        Add Customer
      </h1>
      <label htmlFor={FULLNAME} className="bold-select-wrap">
        <span className="label">Fullname</span>
        <input
          type="text"
          name={FULLNAME}
          id={FULLNAME}
          value={fields[FULLNAME]}
          onChange={handleFieldChange}
          className="text-input"
        />
      </label>
      <label htmlFor={EMAIL} className="bold-select-wrap">
        <span className="label">Email</span>
        <input
          type="text"
          name={EMAIL}
          id={EMAIL}
          value={fields[EMAIL]}
          onChange={handleFieldChange}
          className="text-input"
        />
      </label>
      <label htmlFor={PHONE_NUMBER} className="bold-select-wrap">
        <span className="label">Phone Number</span>
        <input
          type="text"
          name={PHONE_NUMBER}
          id={PHONE_NUMBER}
          value={fields[PHONE_NUMBER]}
          onChange={handleFieldChange}
          className="text-input"
        />
      </label>
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
        <div className="bold-select caret">
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
      </label>
      <label htmlFor={ADDRESS_LINE1} className="bold-select-wrap">
        <span className="label">Address Line 1</span>
        <input
          type="text"
          name={ADDRESS_LINE1}
          id={ADDRESS_LINE1}
          value={fields[ADDRESS_LINE1]}
          onChange={handleFieldChange}
          className="text-input"
        />
      </label>
      <label htmlFor={ADDRESS_LINE2} className="bold-select-wrap">
        <span className="label">Address Line 2</span>
        <input
          type="text"
          name={ADDRESS_LINE2}
          id={ADDRESS_LINE2}
          value={fields[ADDRESS_LINE2]}
          onChange={handleFieldChange}
          className="text-input"
        />
      </label>
      <label htmlFor={ZIP_CODE} className="bold-select-wrap">
        <span className="label">Zip Code</span>
        <input
          type="text"
          name={ZIP_CODE}
          id={ZIP_CODE}
          value={fields[ZIP_CODE]}
          onChange={handleFieldChange}
          className="text-input"
        />
      </label>
      <div className="flex items-center justify-center">
        <button
          type="submit"
          className="py-4 px-12 rounded-[10px] transition-transform hover:scale-105 bg-[#011c39] text-white"
        >
          Add Customer
        </button>
      </div>
    </form>
  );
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

const ModalControls = ({ setEditorModal, setImportModal }) => (
  <div className="flex items-center gap-4">
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
};

const Customers = () => {
  const [editorModal, setEditorModal] = useState({
    busy: false,
    isOpen: false,
  });
  const [importModal, setImportModal] = useState({
    busy: false,
    isOpen: false,
  });

  return (
    <section className="h-full w-full overflow-y-auto" id="company-settings-customer-panel">
      {customers.length ? (
        <>
          <div className="flex items-center justify-between">
            <Heading1>Customers</Heading1>
            <ModalControls setEditorModal={setEditorModal} setImportModal={setImportModal} />
          </div>
          <GridPanel minimumChildWidth={280}>
            {customers.map((customer) => (
              <div key={customer.email} className="p-3">
                <section className="px-6 py-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC]">
                  <h1 className="font-medium text-lg text-[#011c39]">
                    {customer.fullname}
                  </h1>
                  <div className="flex items-center gap-3 text-[#011c39]">
                    <span>{`${customer.email},`}</span>
                    <span>{customer.phoneNumber}</span>
                  </div>
                </section>
              </div>
            ))}
          </GridPanel>
        </>
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
        <CustomerEditor />
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
