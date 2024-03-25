import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Menu, Transition } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { companyProps } from '../utils/propTypes';
import { classNames } from '../utils';
import { updateCompanyAsync } from '../redux/companySlice';
import { loadCountriesAsync, selectCountries } from '../redux/countriesSlice';
import Modal from '../components/Modal';
import { SvgButton, paths } from '../components/svg';
import LoadingButton from '../components/LoadingButton';
import AddressEditor from './AddressEditor';

const timeUnitsObj = {
  Minutes: 'm',
  Hours: 'h',
  Days: 'd',
  Months: 'mo',
  Years: 'y',
};

const timeUnits = Object.keys(timeUnitsObj);

const reversedTimeUnitsObj = Object.entries(timeUnitsObj).reduce((memo, [key, value]) => ({
  ...memo,
  [value]: key,
}), {});

const extractNumbersAndLetters = (inputString) => {
  // Regular expression to match numbers at the beginning of the string
  const numberRegex = /^\d+/;
  // Regular expression to match alphabets at the end of the string
  const letterRegex = /[a-zA-Z]+$/;

  // Extract numbers using numberRegex
  const numbersMatch = inputString.match(numberRegex);
  // Extract letters using letterRegex
  const lettersMatch = inputString.match(letterRegex);

  // Convert extracted numbers to a number
  const numbers = numbersMatch ? Number.parseInt(numbersMatch[0], 10) : 0;
  // Convert extracted letters to a string
  const letters = lettersMatch ? lettersMatch[0] : '';

  return { numbers, letters };
};

export const toDisplayTimeUnit = (time) => {
  const { numbers, letters } = extractNumbersAndLetters(time);

  return `${numbers} ${reversedTimeUnitsObj[letters]}`;
};

export const intVal = (number) => {
  if (!number) {
    return '';
  }

  const value = Number.parseInt(number, 10);

  // eslint-disable-next-line eqeqeq
  return value == number ? value : null;
};

export const TimeAmount = ({ initialValue, name, onChange }) => {
  const [time, setTime] = useState({
    unit: 'Minutes',
    value: 0,
  });
  const mountedRef = useRef(false);

  useEffect(() => {
    if (initialValue) {
      const { letters, numbers } = extractNumbersAndLetters(initialValue);
      let unit;
      for (let i = 0, n = timeUnits.length; i < n; i += 1) {
        unit = timeUnits[i];

        if (timeUnitsObj[unit] === letters) {
          setTime({ unit, value: numbers });
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    if (onChange) {
      onChange(name, `${time.value}${timeUnitsObj[time.unit]}`);
    }
  }, [time]);

  const handleValueChange = ({ target: { value } }) => {
    const newValue = intVal(value);

    if (newValue !== null) {
      setTime((time) => ({ ...time, value: newValue }));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={time.value}
        onChange={handleValueChange}
        className="rounded-3xl w-20 text-center font-medium text-base text-[#5c5c5c] py-[10px] px-4"
        style={{ border: '1px solid #e9ebf8' }}
      />
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button
            className="rounded-3xl text-center font-medium text-base text-[#5c5c5c] py-[10px] px-4 flex items-center justify-between gpa-4 min-w-[110px]"
            style={{ border: '1px solid #e9ebf8' }}
          >
            <span>{time.unit}</span>
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
              {timeUnits.map((unit) => (
                <Menu.Item key={unit}>
                  {({ active }) => (
                    <button
                      type="button"
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        time.unit === unit ? 'px-4' : 'pr-4 pl-11',
                        'w-full py-2 text-left text-lg flex items-center gap-3',
                      )}
                      onClick={() => {
                        if (time.unit !== unit) {
                          setTime((time) => ({ ...time, unit }));
                        }
                      }}
                    >
                      {time.unit === unit ? (
                        <CheckIcon className="-mr-1 h-5 w-5 text-[#89e101]" />
                      ) : null}
                      <span>{unit}</span>
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

TimeAmount.propTypes = {
  initialValue: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

TimeAmount.defaultProps = {
  initialValue: '',
  name: '',
  onChange: null,
};

export const Field = ({
  name,
  title,
  initialValue,
  onChange,
}) => {
  const [busy, setBusy] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [value, setValue] = useState(initialValue);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (onChange) {
      setModalOpen(false);
      onChange(name, value);
      return;
    }

    setBusy(true);

    dispatch(updateCompanyAsync({ [name]: value }), (err) => {
      setBusy(false);

      if (!err) {
        setModalOpen(false);
      }
    });
  };

  return (
    <div className="bold-select-wrap" id={name}>
      {title ? (
        <span className="label">{title}</span>
      ) : null}
      <div
        className="flex items-center justify-between bg-[#f8fafc] border border-[#cbd5e1] p-4 rounded-lg min-h-12"
      >
        <span>{initialValue}</span>
        {name ? (
          <SvgButton
            type="button"
            color="#5c5c5c"
            path={paths.pencil}
            onClick={() => setModalOpen(true)}
            sm
          />
        ) : null}
      </div>
      {name ? (
        <Modal
          isOpen={isModalOpen || busy}
          parentSelector={() => document.querySelector(`#${name}`)}
          onRequestClose={() => {
            if (!busy) {
              setModalOpen(false);
            }
          }}
          shouldCloseOnEsc
          shouldCloseOnOverlayClick
        >
          <form onSubmit={handleSubmit} className="modal-bold-body max-h-[80vh] overflow-auto">
            <label htmlFor={name} className="bold-select-wrap">
              <span className="label">{title || 'Enter Value'}</span>
              <input
                type="text"
                name={name}
                id={name}
                value={value}
                onChange={({ target: { value } }) => setValue(value)}
                className="text-input"
              />
            </label>
            <LoadingButton
              type="submit"
              loading={busy}
              label="Submit"
            />
          </form>
        </Modal>
      ) : null}
    </div>
  );
};

Field.propTypes = {
  initialValue: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string,
  onChange: PropTypes.func,
};

Field.defaultProps = {
  initialValue: '',
  name: '',
  title: '',
  onChange: null,
};

export const AddressFields = ({ company }) => {
  const [busy, setBusy] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const allCountries = useSelector(selectCountries);
  const countries = useMemo(() => {
    const rslt = [];

    if (allCountries) {
      const country = allCountries.find(({ code }) => code === company.country.code);

      if (country) {
        rslt.push(country);
      }
    }

    return rslt;
  }, [allCountries]);
  const dispatch = useDispatch();

  const fields = useMemo(() => {
    const fs = {
      country: '',
      state: '',
      city: '',
      line1: '',
      line2: '',
      zipCode: '',
    };

    if (company.address?.line1) {
      fs.country = company.address.country;
      fs.state = company.address.state;
      fs.city = company.address.city;
      fs.line1 = company.address.line1;
      fs.line2 = company.address.line2;
    }

    return fs;
  }, [company]);

  useEffect(() => {
    if (!allCountries) {
      dispatch(loadCountriesAsync());
    }
  }, []);

  const handleSubmit = () => {
    setBusy(false);
  };

  return (
    <section className="pt-10 flex flex-col gap-4" id="company-bookings-address-panel">
      <div className="flex items-center gap-12">
        <h1 className="m-0 font-bold text-xs text-[#011c39]">
          ADDRESS
        </h1>
        <SvgButton
          type="button"
          title="Edit"
          color="#5c5c5c"
          path={paths.pencil}
          onClick={() => setModalOpen(true)}
          sm
        />
      </div>
      <div className="flex flex-col gap-4 pl-4">
        <Field title="Country" initialValue={fields.country} />
        <Field title="State" initialValue={fields.state} />
        <Field title="City" initialValue={fields.city} />
        <Field title="Line 1" initialValue={fields.line1} />
        <Field title="Line 2" initialValue={fields.line2} />
        <Field title="Zip Code / Postal Code" initialValue={fields.zipCode} />
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
        <AddressEditor busy={busy} countries={countries} onSubmit={handleSubmit} />
      </Modal>
    </section>
  );
};

AddressFields.propTypes = {
  company: companyProps.isRequired,
};
