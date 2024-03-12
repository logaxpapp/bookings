import {
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { countryProps } from '../utils/propTypes';
import LoadingButton from '../components/LoadingButton';

const CITY = 'city';
const COUNTRY = 'country';
const LINE1 = 'line1';
const LINE2 = 'line2';
const STATE = 'state';
const ZIP_CODE = 'zip_code';

const AddressEditor = ({ busy, countries, onSubmit }) => {
  const [country, setCountry] = useState(countries[0]);
  const [state, setState] = useState(country && country.states[0]);
  const [city, setCity] = useState(state && state.cities[0]);
  const [fields, setFields] = useState({
    [LINE1]: '',
    [LINE2]: '',
    [ZIP_CODE]: '',
  });

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
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="modal-bold-body max-h-[80vh] overflow-auto">
      <h1 className="m-0 text-lg font-semibold">
        Update Your Address
      </h1>
      <label htmlFor={COUNTRY} className="bold-select-wrap">
        <span className="label">Select Country</span>
        <div className="bold-select">
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
        <div className="bold-select">
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
        <div className="bold-select">
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
      <label htmlFor={LINE1} className="bold-select-wrap">
        <span className="label">Line 1</span>
        <input
          type="text"
          name={LINE1}
          id={LINE1}
          value={fields[LINE1]}
          onChange={handleFieldChange}
          className="text-input"
        />
      </label>
      <label htmlFor={LINE2} className="bold-select-wrap">
        <span className="label">Line 2</span>
        <input
          type="text"
          name={LINE2}
          id={LINE2}
          value={fields[LINE2]}
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
      <LoadingButton
        type="submit"
        loading={busy}
        label="Submit"
        styles={{ marginTop: 0 }}
      />
    </form>
  );
};

AddressEditor.propTypes = {
  busy: PropTypes.bool,
  countries: PropTypes.arrayOf(countryProps).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

AddressEditor.defaultProps = {
  busy: false,
};

export default AddressEditor;
