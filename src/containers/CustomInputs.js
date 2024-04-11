import {
  Fragment,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Menu, Transition } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { classNames } from '../utils';
import { updateCompanyAsync } from '../redux/companySlice';
import Modal from '../components/Modal';
import { SvgButton, paths } from '../components/svg';
import LoadingButton from '../components/LoadingButton';

const timeUnitsObj = {
  Minutes: 'm',
  Hours: 'h',
  Days: 'd',
  Weeks: 'w',
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
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    if (onChange) {
      onChange(name, `${time.value || 0}${timeUnitsObj[time.unit]}`);
    }
  }, [time]);

  useEffect(() => {
    if (initialValue) {
      const { letters, numbers } = extractNumbersAndLetters(initialValue);
      let unit;
      for (let i = 0, n = timeUnits.length; i < n; i += 1) {
        unit = timeUnits[i];

        if (timeUnitsObj[unit] === letters) {
          mountedRef.current = false;
          setTime({ unit, value: numbers });
          break;
        }
      }
    }
  }, []);

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

  useEffect(() => {
    if (name) {
      setValue(initialValue);
    }
  }, [initialValue]);

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
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  onChange: PropTypes.func,
};

Field.defaultProps = {
  initialValue: '',
  name: '',
  title: '',
  onChange: null,
};
