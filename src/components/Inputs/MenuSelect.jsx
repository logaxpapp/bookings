import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { classNames } from '../../utils';
import { childrenProps } from '../../utils/propTypes';

const MenuSelect = ({
  value,
  options,
  onSelect,
  right,
}) => {
  const handleClick = ({ target: { name } }) => {
    if (onSelect && name !== value) {
      onSelect(name);
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          <span className="text-[#5c5c5c] font-medium text-sm">{value}</span>
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-[#5c5c5c]" aria-hidden="true" />
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
          className={`absolute right-0 z-10 mt-2 w-56 rounded-md bg-white dark:bg-[#24303f] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${right ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}`}
        >
          <div className="py-1">
            {options.map((opt) => (
              <Menu.Item key={opt}>
                {({ active }) => (
                  <button
                    type="button"
                    name={opt}
                    className={classNames(
                      active ? 'bg-gray-100 text-slate-900' : 'text-slate-700',
                      'w-full py-2 px-5 text-left text-lg flex items-center gap-3 hover:bg-[#e6e8eB] dark:hover:bg-meta-4 dark:text-white disabled:text-slate-400 dark:disabled:text-slate-400 disabled:bg-transparent dark:disabled:hover:bg-transparent',
                    )}
                    onClick={handleClick}
                  >
                    {opt}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

MenuSelect.propTypes = {
  value: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  onSelect: PropTypes.func,
  right: PropTypes.bool,
};

MenuSelect.defaultProps = {
  value: '',
  options: [],
  onSelect: null,
  right: false,
};

export const ContextMenu = ({
  children,
  options,
  onClick,
  right,
}) => (
  <Menu as="div" className="relative inline-block text-left">
    <div>
      <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-transparent text-[#5c5c5c] dark:text-slate-100">
        {children}
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
        className={`absolute right-0 z-10 mt-2 w-56 rounded-md bg-white dark:bg-[#24303f] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${right ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}`}
      >
        <div className="py-1">
          {options.map((opt) => (
            <Menu.Item key={opt}>
              {() => (
                <button
                  type="button"
                  name={opt}
                  className="w-full py-2 px-5 text-left text-lg flex items-center gap-3 hover:bg-[#e6e8eB] dark:hover:bg-meta-4 dark:text-white disabled:text-slate-400 dark:disabled:text-slate-400 disabled:bg-transparent dark:disabled:hover:bg-transparent"
                  onClick={() => onClick(opt)}
                >
                  {opt}
                </button>
              )}
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Transition>
  </Menu>
);

ContextMenu.propTypes = {
  options: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  onClick: PropTypes.func.isRequired,
  children: childrenProps.isRequired,
  right: PropTypes.bool,
};

ContextMenu.defaultProps = {
  options: [],
  right: false,
};

export default MenuSelect;
