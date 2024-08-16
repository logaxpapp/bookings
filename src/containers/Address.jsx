import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { countryProps } from '../utils/propTypes';
import { Input } from '../components/TextBox';
import { SvgButton, paths } from '../components/svg';
import { Field } from './CustomInputs';
import Modal from '../components/Modal';
import { Button } from '../components/Buttons';

const CITY = 'city';
const COUNTRY = 'country';
const LINE1 = 'line1';
const LINE2 = 'line2';
const STATE = 'state';
const ZIP_CODE = 'zip_code';

const addressProps = PropTypes.shape({
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
});

export const AddressEditor = ({
  address,
  busy,
  countries,
  onSubmit,
}) => {
  const [country, setCountry] = useState(countries[0]);
  const [state, setState] = useState(country && country.states[0]);
  const [city, setCity] = useState(state && state.cities[0]);
  const [fields, setFields] = useState({
    [LINE1]: '',
    [LINE2]: '',
    [ZIP_CODE]: '',
  });
  const [errors, setErrors] = useState({
    [LINE1]: '',
    [ZIP_CODE]: '',
    [CITY]: '',
  });

  useEffect(() => {
    if (address) {
      setFields({
        [LINE1]: address.line1 || '',
        [LINE2]: address.line2 || '',
        [ZIP_CODE]: address.zipCode || '',
      });
      let id = address.city?.state?.country?.id;
      if (id) {
        const country = countries.find((c) => c.id === id);
        if (country) {
          setCountry(country);
          id = address.city.state.id;
          if (id) {
            const state = country.states.find((s) => s.id === id);

            if (state) {
              setState(state);
              id = address.city.id;

              if (id) {
                const city = state.cities.find((c) => c.id === id);
                if (city) {
                  setCity(city);
                }
              }
            }
          }
        }
      }
    }
  }, [address]);

  const selectState = (state) => {
    setState(state);

    if (state) {
      setCity(state.cities[0]);
    } else {
      setCity(null);
    }
  };

  const selectCountry = (country) => {
    setCountry(country);
    if (country) {
      selectState(country.states[0]);
    } else {
      setState(null);
      setCity(null);
    }
  };

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

  const handleFieldChange = ({ target: { name, value } }) => setFields((fields) => (
    { ...fields, [name]: value }
  ));

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};

    if (!fields.line1) {
      errors[LINE1] = 'This field is required!';
    }

    if (!fields.zip_code) {
      errors[ZIP_CODE] = 'This field is required!';
    }

    if (!city) {
      errors[CITY] = 'Please select a city!';
    }

    setErrors(errors);

    if (Object.keys(errors).length) {
      return;
    }

    onSubmit({ ...fields, city_id: city.id });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="modal-bold-body max-h-[80vh] overflow-auto"
    >
      <h1 className="m-0 text-lg font-semibold">
        Update Your Address
      </h1>
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
        label="Line 1"
        name={LINE1}
        value={fields[LINE1]}
        onChange={handleFieldChange}
        error={errors.line1}
      />
      <Input
        type="text"
        label="Line 2"
        name={LINE2}
        value={fields[LINE2]}
        onChange={handleFieldChange}
      />
      <Input
        type="text"
        label="Zip Code"
        name={ZIP_CODE}
        value={fields[ZIP_CODE]}
        onChange={handleFieldChange}
        error={errors.zip_code}
      />
      <div className="flex justify-center pt-4">
        <Button type="submit" busy={busy} className="px-10">
          Submit
        </Button>
      </div>
    </form>
  );
};

AddressEditor.propTypes = {
  address: addressProps,
  busy: PropTypes.bool,
  countries: PropTypes.arrayOf(countryProps).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

AddressEditor.defaultProps = {
  address: null,
  busy: false,
};

export const AddressFields = ({
  address,
  countries,
  onEdit,
  bottomControl,
}) => {
  const [busy, setBusy] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const fields = useMemo(() => {
    const fs = {
      country: address?.city?.state?.country?.name || '',
      state: address?.city?.state?.name || '',
      city: address?.city?.name || '',
      line1: address?.line1 || '',
      line2: address?.line2 || '',
      zipCode: address?.zipCode || '',
    };

    return fs;
  }, [address]);

  const handleEdit = (data) => {
    setBusy(true);
    onEdit(data, (err) => {
      setBusy(false);

      if (!err) {
        setModalOpen(false);
      }
    });
  };

  return (
    <section className="pt-10 flex flex-col gap-4" id="company-bookings-address-panel">
      {bottomControl ? null : (
        <div className="flex items-center gap-12">
          <h1 className="m-0 font-bold text-xs text-[#011c39] dark:text-white">
            ADDRESS
          </h1>
          {onEdit ? (
            <SvgButton
              type="button"
              title="Edit"
              color="#5c5c5c"
              path={paths.pencil}
              onClick={() => setModalOpen(true)}
              sm
            />
          ) : null}
        </div>
      )}
      <div className={`flex flex-col gap-6 ${bottomControl ? '' : 'pl-4'}`}>
        <Field title="Country" initialValue={fields.country} />
        <Field title="State" initialValue={fields.state} />
        <Field title="City" initialValue={fields.city} />
        <Field title="Line 1" initialValue={fields.line1} />
        <Field title="Line 2" initialValue={fields.line2} />
        <Field title="Zip Code / Postal Code" initialValue={fields.zipCode} />
        {bottomControl ? (
          <div className="flex items-center gap-4 pt-8">
            <Button onClick={() => setModalOpen(true)} className="px-8">Edit</Button>
          </div>
        ) : null}
      </div>
      <Modal
        isOpen={isModalOpen || busy}
        parentSelector={() => document.querySelector('#company-bookings-address-panel')}
        onRequestClose={() => {
          if (!busy) {
            setModalOpen(false);
          }
        }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <AddressEditor
          address={address}
          busy={busy}
          countries={countries}
          onSubmit={handleEdit}
        />
      </Modal>
    </section>
  );
};

AddressFields.propTypes = {
  address: addressProps.isRequired,
  countries: PropTypes.arrayOf(countryProps).isRequired,
  onEdit: PropTypes.func,
  bottomControl: PropTypes.bool,
};

AddressFields.defaultProps = {
  onEdit: null,
  bottomControl: false,
};
