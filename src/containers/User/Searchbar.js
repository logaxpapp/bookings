import { Fragment, useMemo, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { CheckIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { userProps } from '../../utils/propTypes';
import { searchParamsOptions } from '../../utils/userPreferences';
import UserLocation from '../../utils/userLocation';
import { selectSearchParams, setSearchParams } from '../../redux/userPreferences';
import filterIcon from '../../assets/images/filter.svg';
import { classNames } from '../../utils';
import routes from '../../routing/routes';

const FilterMenu = ({ user }) => {
  const options = useMemo(() => [
    {
      label: 'Use My Home Location',
      text: 'Home location',
      value: searchParamsOptions.HOME_LOCATION,
      disabled: !UserLocation.getLocation().isValid,
    },
    {
      label: 'Use My Device Location',
      text: 'Device location',
      value: searchParamsOptions.DEVICE_LOCATION,
      disabled: false,
    },
    {
      label: 'Use Network Provided Location',
      text: 'Network location',
      value: searchParamsOptions.NETWORK_LOCATION,
      disabled: false,
    },
    {
      label: 'Use My Address',
      text: 'My address',
      value: searchParamsOptions.User_CITY,
      disabled: !user.address,
    },
  ], []);

  const savedSearchParams = useSelector(selectSearchParams);
  const selectedOption = useMemo(() => {
    let param;
    const hasPreferredLocation = UserLocation.getLocation().hasData;
    if (hasPreferredLocation && savedSearchParams === searchParamsOptions.HOME_LOCATION) {
      param = searchParamsOptions.HOME_LOCATION;
    } else if (savedSearchParams === searchParamsOptions.User_CITY && user.address) {
      param = searchParamsOptions.User_CITY;
    } else if (savedSearchParams === searchParamsOptions.NETWORK_LOCATION) {
      param = searchParamsOptions.NETWORK_LOCATION;
    } else {
      param = searchParamsOptions.DEVICE_LOCATION;
    }

    return options.find(({ value }) => value === param);
  }, [savedSearchParams]);
  const dispatch = useDispatch();

  const handleSelect = (option) => {
    dispatch(setSearchParams(option.value));
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          className="bg-white flex items-center gap-1 rounded-[10px] border border-[#8E98A8] p-3 font-medium text-lg text-[#8E98A8] dark:text-white dark:bg-[#24303f] dark:border-[#334255]"
        >
          <span
            className="w-5 h-5 bg-[#8E98A8] dark:bg-white"
            style={{ maskImage: `url(${filterIcon})`, maskSize: '100% 100%' }}
          />
          <span>{selectedOption.text}</span>
          <ChevronDownIcon className="w-5 h-5 text-[#8E98A8] dark:text-white" />
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-90 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-[#24303f]">
          <div className="py-1">
            {options.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    type="button"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      option.value === selectedOption.value ? 'px-4' : 'pr-4 pl-11',
                      'w-full py-2 text-left text-lg flex items-center gap-3 hover:bg-[#e6e8eB] dark:hover:bg-meta-4 dark:text-white disabled:text-slate-400 dark:disabled:text-slate-400 disabled:bg-transparent dark:disabled:hover:bg-transparent',
                    )}
                    onClick={() => handleSelect(option)}
                    disabled={option.disabled}
                  >
                    {option.value === selectedOption.value ? (
                      <CheckIcon className="-mr-1 h-5 w-5 text-[#89e101]" />
                    ) : null}
                    <span>{option.label}</span>
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

FilterMenu.propTypes = {
  user: userProps.isRequired,
};

const Searchbar = ({ user }) => {
  const [term, setTerm] = useState('');
  const { greetings, timeZone } = useMemo(() => {
    let offset = -(new Date().getTimezoneOffset() / 60);
    let sign = '+';

    if (offset < 0) {
      offset *= -1;
      sign = '-';
    }

    return {
      greetings: `Hi ${user.firstname}`,
      timeZone: `GMT ${sign} ${offset}`,
    };
  }, []);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!term) {
      return;
    }

    const temp = term;
    setTerm('');
    navigate(`${routes.user.dashboard.absolute.search}?term=${temp}`);
  };

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-17">
      <div className="flex flex-col gap-3">
        <span className="font-semibold text-[28px] text-[#393939] dark:text-white">
          {greetings}
        </span>
        <span className="font-medium text-base text-[#aeaeae]">
          {timeZone}
        </span>
      </div>
      <div className="w-full sm:flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <form onSubmit={handleSubmit} className="flex-1">
          <label
            aria-label="search"
            htmlFor="service-search-input"
            className="w-full flex items-center gap-5 px-4 bg-white dark:bg-[#24303f] dark:border-[#334255] rounded-[10px] border border-[#8E98A8]"
          >
            <MagnifyingGlassIcon aria-hidden="true" className="w-5 h-5 text-[#8E98A8] dark:text-white" />
            <input
              type="text"
              name="search"
              id="service-search-input"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="What services do you need?"
              className="flex-1 py-3 font-medium text-lg dark:bg-[#24303f] dark:text-white"
            />
          </label>
        </form>
        <div className="w-full sm:w-auto flex sm:block justify-end">
          <FilterMenu user={user} />
        </div>
      </div>
    </div>
  );
};

Searchbar.propTypes = {
  user: userProps.isRequired,
};

export default Searchbar;
