import { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { classNames } from '../utils';

const MenuSelect = ({
  options,
  name,
  value,
  onChange,
  className,
  plain,
}) => {
  const handleChange = (value) => {
    if (onChange) {
      onChange(name, value);
    }
  };

  const buttonClass = useMemo(() => {
    let style = 'inline-flex w-full justify-center gap-x-1.5 bg-white text-sm font-semibold text-gray-900  hover:bg-gray-50';

    if (!plain) {
      style = `${style} rounded-md px-3 py-2 shadow-sm ring-1 ring-inset ring-gray-300`;
    }

    if (className) {
      style = `${style} ${className}`;
    }

    return style;
  }, [className, plain]);

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button
            className={buttonClass}
          >
            <div className="flex items-center gap-1">
              <span>{value}</span>
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
              {options.map((option) => (
                <Menu.Item key={option}>
                  {({ active }) => (
                    <button
                      type="button"
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block w-full px-4 py-2 text-left text-lg',
                      )}
                      onClick={() => handleChange(option)}
                    >
                      {option}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
};

MenuSelect.propTypes = {
  options: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  className: PropTypes.string,
  plain: PropTypes.bool,
};

MenuSelect.defaultProps = {
  options: [],
  name: '',
  value: '',
  onChange: null,
  className: '',
  plain: false,
};

export default MenuSelect;
