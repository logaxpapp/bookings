import { Fragment, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import FieldRow from './FieldRow';
import UserLocation from '../../utils/userLocation';
import { capitalize, classNames, notification } from '../../utils';
import Modal, { useBusyModal } from '../Modal';
import { Input, isNumber } from '../TextBox';
import { Button } from '../Buttons';
import { getUserLocation, loadIPLocationAsync } from '../../redux/userLocationSlice';

const LATITUDE = 'latitude';
const LONGITUDE = 'longitude';
const DEVICE_LOCATION = 'device_location';
const NETWORK_LOCATION = 'network_location';
const MANUAL = 'manual';

const options = {
  [DEVICE_LOCATION]: 'Use current device location',
  [NETWORK_LOCATION]: 'Use network provided location',
  [MANUAL]: 'Manually edit location',
};

const optionKeys = Object.keys(options);

const HomeLocation = () => {
  const [location, setLocation] = useState(() => {
    const userLocation = UserLocation.getLocation();
    return {
      latitude: userLocation.latitude || '',
      longitude: userLocation.longitude || '',
    };
  });
  const [latitude, setLatitude] = useState(location.latitude);
  const [longitude, setLongitude] = useState(location.longitude);
  const [manualEditor, setManualEditor] = useState({ isOpen: false, busy: false });
  const busyModal = useBusyModal();
  const dispatch = useDispatch();

  const handleEditField = (name, value, callback) => {
    if (value) {
      const floatValue = Number.parseFloat(value);

      if (`${floatValue}` === value) {
        let { latitude, longitude } = location;

        if (name === LATITUDE) {
          latitude = floatValue;
        } else if (name === LONGITUDE) {
          longitude = floatValue;
        }

        UserLocation.getLocation().save(latitude, longitude);
        setLocation({ latitude, longitude });

        let notice = `${capitalize(name)} successfully updated.`;
        const otherProp = name === LATITUDE ? LONGITUDE : LATITUDE;

        if (!location[otherProp]) {
          notice = `${notice} Please update ${capitalize(otherProp)} to make your home location valid`;
        }

        notification.showSuccess(notice);
        callback();
        return;
      }
    }

    const msg = `Invalid value for ${name}`;
    notification.showError(msg);
    callback(msg);
  };

  const handleEditLocation = ({ target: { name } }) => {
    if (name === MANUAL) {
      setManualEditor({ isOpen: true, busy: false });
    } else if (name === DEVICE_LOCATION) {
      busyModal.showLoader();
      getUserLocation()
        .then((location) => {
          const { latitude, longitude } = location;
          UserLocation.getLocation().save(latitude, longitude);
          setLocation({ latitude, longitude });
          setLatitude(latitude);
          setLongitude(longitude);
          busyModal.hideLoader();
        })
        .catch(() => {
          notification.showError(
            'Error determining your location. Please ensure that location is enabled for this page, then try again!',
          );
          busyModal.hideLoader();
        });
    } else if (name === NETWORK_LOCATION) {
      busyModal.showLoader();
      dispatch(loadIPLocationAsync((err, location) => {
        if (!err) {
          const { latitude, longitude } = location;
          UserLocation.getLocation().save(latitude, longitude);
          setLocation({ latitude, longitude });
          setLatitude(latitude);
          setLongitude(longitude);
        } else {
          notification.showError(
            'Error determining your location. Please try again!',
          );
        }
        busyModal.hideLoader();
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!longitude) {
      notification.showError('Please provide a valid number for longitude!');
      return;
    }

    if (!latitude) {
      notification.showError('Please provide a valid number for latitude!');
      return;
    }

    const lat = Number.parseFloat(latitude);
    const lng = Number.parseFloat(longitude);

    UserLocation.getLocation().save(lat, lng);
    setLocation({ latitude: lat, longitude: lng });

    notification.showSuccess('Location successfully updated!');
  };

  const handleValueChange = ({ target: { name, value } }) => {
    if (!isNumber(value)) {
      return;
    }

    if (name === LONGITUDE) {
      setLongitude(value);
    } else if (name === LATITUDE) {
      setLatitude(value);
    }
  };

  return (
    <section className="flex-1 h-full overflow-auto flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <h1 className="font-semmibold text-2xl text-[#393939] dark:text-white">Home Location</h1>
        <p className="text-sm text-[#8E98A8] dark:text-[#dfe2e6]">
          Update your home location (These settings are saved on your device.)
        </p>
      </header>
      <div className="flex flex-col gap-8 w-6/12 pb-8">
        <FieldRow
          name={LONGITUDE}
          label="Longitude"
          value={location.longitude || 'Set Longitude'}
          onEdit={handleEditField}
        />
        <FieldRow
          name={LATITUDE}
          label="Latitude"
          value={location.latitude || 'Set Latitude'}
          onEdit={handleEditField}
        />
        <div className="pt-6">
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button
                className="bg-[#011c39] flex items-center gap-8 rounded-[10px] border border-[#30363f] py-2 px-4 font-medium text-lg text-white dark:bg-[#24303f] dark:border-[#334255]"
              >
                <span>Edit</span>
                <ChevronDownIcon className="w-5 h-5 text-white" />
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
              <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-[#1a222c] translate-x-[90%] -translate-y-[120%]">
                <div className="py-1">
                  {optionKeys.map((key) => (
                    <Menu.Item key={key}>
                      {({ active }) => (
                        <button
                          type="button"
                          name={key}
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'w-full py-2 px-6 text-left text-lg flex items-center gap-3 hover:bg-[#e6e8eB] dark:hover:bg-meta-4 dark:text-white disabled:text-slate-400 dark:disabled:text-slate-400 disabled:bg-transparent dark:disabled:hover:bg-transparent',
                          )}
                          onClick={handleEditLocation}
                        >
                          {options[key]}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
      <Modal
        isOpen={manualEditor.isOpen || manualEditor.busy}
        parentSelector={() => document.querySelector('#root')}
        onRequestClose={() => {
          if (!manualEditor.busy) {
            setManualEditor({ isOpen: false, busy: false });
          }
        }}
        style={{ content: { maxWidth: 480 } }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <section className="py-6 px-8 flex flex-col gap-8">
          <header className="flex items-center gap-4">
            <ExclamationTriangleIcon aria-hidden="true" className="w-6 h-6 text-[#ee4f4f]" />
            <h1 className="text-[#ee4f4f] m-0 font-bold text-sm">
              Please be sure you know what you are doing before editing these fields!
            </h1>
          </header>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input
              type="text"
              name={LONGITUDE}
              value={longitude}
              label="Longitude"
              onChange={handleValueChange}
            />
            <Input
              type="text"
              name={LATITUDE}
              value={latitude}
              label="Latitude"
              onChange={handleValueChange}
            />
            <div className="fle items-center pt-3">
              <Button
                type="submit"
                busy={manualEditor.busy}
                className="px-10"
              >
                Confirm
              </Button>
            </div>
          </form>
        </section>
      </Modal>
    </section>
  );
};

export default HomeLocation;
