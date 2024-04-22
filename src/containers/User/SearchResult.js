import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { ArrowUpOnSquareIcon, BookmarkSquareIcon } from '@heroicons/react/24/outline';
import image from '../../assets/images/WhatsApp Image 2023-12-13 at 17.03.01_67092e8d.jpg';
import { Button } from '../../components/Buttons';
import { companyProps, serviceProps, timeSlotProps } from '../../utils/propTypes';
import {
  addressText,
  currencyHelper,
  rootSelector,
  toDuration,
} from '../../utils';
import defaultImages from '../../utils/defaultImages';
import Modal from '../../components/Modal';
import DatePicker from '../../components/DatePicker';
import { useWindowSize } from '../../lib/hooks';
import GridPanel from '../../components/GridPanel';

const panelSizes = {
  MINI: 320,
  MEDIUM: 580,
  LARGE: 750,
};

const ServiceProperty = ({ title, value }) => (
  <div className="flex flex-col gap-1.5">
    <span className="font-medium text-[10px] text-[#89E101]">
      {title}
    </span>
    <span className="font-semibold text-base text-[#011c39] dark:text-white">
      {value}
    </span>
  </div>
);

ServiceProperty.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

const SlotButton = ({
  slot,
  selectedSlot,
  onSelected,
  mini,
}) => {
  const time = useMemo(() => {
    const parts = new Date(slot.time).toLocaleTimeString().split(':');
    const apm = parts.pop().split(' ').pop().toUpperCase();

    return `${parts.join(':')} ${apm}`;
  }, [slot]);

  const isSelected = useMemo(() => slot.id === selectedSlot?.id, [slot, selectedSlot]);

  const select = () => {
    if (!isSelected) {
      onSelected(slot);
    }
  };

  return (
    <button
      type="button"
      aria-current={isSelected}
      onClick={select}
      className={`border border-[#89E101] font-bold text-sm ${isSelected ? 'text-[#011c39] bg-[#89E101]' : 'bg-transparent text-[#89E101]'} ${mini ? 'py-2 w-28' : 'w-35 py-3.5'}`}
    >
      {time}
    </button>
  );
};

SlotButton.propTypes = {
  slot: timeSlotProps.isRequired,
  selectedSlot: timeSlotProps,
  onSelected: PropTypes.func.isRequired,
  mini: PropTypes.bool,
};

SlotButton.defaultProps = {
  selectedSlot: null,
  mini: false,
};

const mockTimeSlots = [
  {
    id: 1063,
    time: '2024-04-07T14:00:00.000Z',
    serviceId: 6,
  },
  {
    id: 1064,
    time: '2024-04-07T14:45:00.000Z',
    serviceId: 6,
  },
  {
    id: 1094,
    time: '2024-04-07T15:30:00.000Z',
    serviceId: 6,
  },
  {
    id: 1095,
    time: '2024-04-07T16:15:00.000Z',
    serviceId: 6,
  },
  {
    id: 1096,
    time: '2024-04-07T17:00:00.000Z',
    serviceId: 6,
  },
  {
    id: 1097,
    time: '2024-04-07T17:45:00.000Z',
    serviceId: 6,
  },
  {
    id: 1098,
    time: '2024-04-07T18:30:00.000Z',
    serviceId: 6,
  },
];

const maxIndex = mockTimeSlots.length - 3;

const SlotsPanel = ({
  service,
  address,
  price,
  deposit,
  duration,
  panelWidth,
  setPanelWidth,
}) => {
  const [date, setDate] = useState(new Date());
  const slots = useMemo(() => {
    const start = Math.round(Math.random() * maxIndex);

    return mockTimeSlots.slice(start);
  }, [date]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const panelRef = useRef(null);
  const { width } = useWindowSize();

  useEffect(() => setSelectedSlot(null), [date]);

  useEffect(() => {
    setPanelWidth(() => {
      if (width < 620) {
        return panelSizes.MINI;
      }
      if (width < 768) {
        return panelSizes.MEDIUM;
      }
      return panelSizes.LARGE;
    });
  }, [width]);

  const isMini = panelWidth <= panelSizes.MINI;
  const isLarge = panelWidth > panelSizes.MEDIUM;

  return (
    <section
      ref={panelRef}
      className="flex flex-col gap-10 max-h-[90vh] overflow-auto px-10 py-15"
    >
      <div
        className={`flex gap-6 ${isLarge ? 'h-50 overflow-hidden' : 'flex-col'}`}
      >
        <div className={`grid gap-6 ${isMini ? 'grid-cols-1 w-60' : 'grid-cols-2 w-125'}`}>
          <div
            className={`flex flex-col ${panelWidth <= panelSizes.MINI ? 'w-full gap-8' : 'flex-1 justify-between gap-4 h-full overflow-hidden'}`}
          >
            <header className="flex-1 flex flex-col gap-2 overflow-hidden">
              <h1 className="m-0 font-bold text-2xl text-[#011c39] dark:text-white">
                {service.company.name}
              </h1>
              <p className="m-0 font-normal text-sm text-[#011c39] dark:text-white flex-1 overflow-auto">
                {address}
              </p>
            </header>
            <div className="flex flex-col gap-3">
              <h2 className="m-0 font-bold text-sm text-[#011c39] dark:text-white">
                {service.name}
              </h2>
              <div className="flex items-center gap-6">
                <ServiceProperty title="Price" value={price} />
                <ServiceProperty title="Duration" value={duration} />
                <ServiceProperty title="Deposit" value={deposit} />
              </div>
            </div>
          </div>
          <div className={`max-w-60 ${isMini ? 'mx-auto h-50' : 'h-full'}`}>
            <DatePicker initialDate={date} onDateChange={setDate} />
          </div>
        </div>
        {isLarge ? (
          <div className="flex flex-col gap-2 h-full overflow-y-auto overflow-x-hidden pr-0.5">
            {slots.map((slot) => (
              <SlotButton
                key={slot.id}
                slot={slot}
                selectedSlot={selectedSlot}
                onSelected={(slot) => setSelectedSlot(slot)}
              />
            ))}
          </div>
        ) : (
          <GridPanel minimumChildWidth={isMini ? 116 : 142}>
            {slots.map((slot) => (
              <div key={slot.id} className="p-[1px] flex justify-center">
                <SlotButton
                  slot={slot}
                  selectedSlot={selectedSlot}
                  onSelected={(slot) => setSelectedSlot(slot)}
                  mini={isMini}
                />
              </div>
            ))}
          </GridPanel>
        )}
      </div>
      <div className="flex justify-end">
        {selectedSlot ? (
          <Button
            type="button"
            className="!px-10 h-11"
          >
            {service.minDeposit ? 'Pay Deposit' : 'Book'}
          </Button>
        ) : (
          <p
            className="m-0 text-[#011c39] dark:text-white font-bold text-base h-11 flex items-end"
          >
            {slots.length ? 'Please select a timeslot to proceed' : 'No timeslots found for the selected date!'}
          </p>
        )}
      </div>
    </section>
  );
};

SlotsPanel.propTypes = {
  service: serviceProps.isRequired,
  address: PropTypes.string,
  price: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  deposit: PropTypes.string,
  panelWidth: PropTypes.number,
  setPanelWidth: PropTypes.func.isRequired,
};

SlotsPanel.defaultProps = {
  address: '',
  deposit: '',
  panelWidth: 750,
};

const ServicePanel = ({ service }) => {
  const [modalState, setModalState] = useState({ busy: false, isOpen: false });
  const {
    address,
    price,
    deposit,
    duration,
  } = useMemo(() => {
    const price = currencyHelper.toString(service.price, service.company.country.currencySymbol);
    let deposit = '';
    if (service.minDeposit) {
      deposit = currencyHelper.toString(service.minDeposit, service.company.country.currencySymbol);
    }
    const duration = toDuration(service.duration);
    const images = service.images.filter((img, idx) => idx < 2);

    return {
      address: addressText(service.company.address),
      price,
      deposit,
      duration,
      images,
    };
  }, []);
  const [panelWidth, setPanelWidth] = useState(750);

  return (
    <section className="flex flex-col gap-2.5">
      <header className="w-full max-w-[490px] flex items-center gap-2">
        <button
          type="button"
          aria-label="view pictures"
          title="View Pictures"
          className="outline-none border-none p-1 bg-transparent cursor-pointer"
        >
          <ArrowUpOnSquareIcon className="w-4.5 h-4.5 text-[#5c5c5c] dark:text-white" />
        </button>
        <h1
          className="text-sm font-semibold text-[#011c39] dark:text-white m-0 flex-1 text-ellipsis whitespace-nowrap"
          title={service.name}
        >
          {service.name}
        </h1>
      </header>
      <div className="grid grid-cols-4">
        <ServiceProperty title="Price" value={price} />
        <ServiceProperty title="Duration" value={duration} />
        <ServiceProperty title="Deposit" value={deposit} />
        <div>
          <Button type="button" onClick={() => setModalState({ busy: false, isOpen: true })}>
            Book
          </Button>
        </div>
      </div>
      <Modal
        isOpen={modalState.isOpen || modalState.busy}
        parentSelector={rootSelector}
        onRequestClose={() => {
          if (!modalState.busy) {
            setModalState({ busy: false, isOpen: false });
          }
        }}
        style={{ content: { maxWidth: panelWidth } }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <SlotsPanel
          service={service}
          address={address}
          price={price}
          duration={duration}
          deposit={deposit}
          panelWidth={panelWidth}
          setPanelWidth={setPanelWidth}
        />
      </Modal>
    </section>
  );
};

ServicePanel.propTypes = {
  service: serviceProps.isRequired,
};

const SearchItem = ({ item }) => {
  const [address, picture] = useMemo(() => [
    addressText(item.company.address),
    item.company.profilePicture || defaultImages.profile,
  ], []);

  return (
    <div className="w-full flex gap-4">
      <div className="flex-1">
        <img className="rounded" src={picture} alt={item.company.name} />
      </div>
      <section className="p-5 dark:bg-boxdark flex-1 flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <div className="w-full max-w-125 flex items-center justify-between">
            <h1
              title={item.company.name}
              className="m-0  text-2xl font-bold tracking-tight text-[#011c39] dark:text-white flex-1 text-ellipsis whitespace-nowrap"
            >
              {item.company.name}
            </h1>
            <button
              type="button"
              aria-label="bookmark"
              title="Bookmark"
              className="outline-none border-none p-1 bg-transparent cursor-pointer"
            >
              <BookmarkSquareIcon className="w-4.5 h-4.5 text-[#5c5c5c] dark:text-white" />
            </button>
          </div>
          <p className="m-0 font-normal text-[#011c39] dark:text-gray">
            {address}
          </p>
        </header>
        {item.services.map((service) => (
          <ServicePanel key={service.id} service={service} />
        ))}
      </section>
    </div>
  );
};

SearchItem.propTypes = {
  item: PropTypes.shape({
    company: companyProps,
    services: PropTypes.arrayOf(serviceProps),
  }).isRequired,
};

const mockCompany = {
  profilePicture: image,
  name: 'Telesvade',
  about: 'Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order',
  address: {
    id: 1,
    line1: 'No 28 Ajegunle Street Leventis Area, Mokola',
    city: {
      id: 1,
      name: 'Ibadan',
      state: {
        id: 1,
        name: 'Oyo',
        country: {
          id: 1,
          name: 'Nigeria',
        },
      },
    },
  },
  country: {
    id: 1,
    name: 'Nigeria',
    currencySymbol: '$',
  },
};

const mock = [
  {
    company: mockCompany,
    services: [
      {
        id: 1,
        name: 'Crew Cut',
        price: 200000,
        duration: 2700,
        minDeposit: 50000,
        company: mockCompany,
        images: [],
      },
      {
        id: 2,
        name: 'Mohawk',
        price: 150000,
        duration: 1800,
        minDeposit: 30000,
        company: mockCompany,
        images: [],
      },
    ],
  },
].reduce((memo, current, idx) => {
  for (let i = 0; i < 25; i += 1) {
    memo.push({ ...current, company: { ...current.company, id: i * (idx + 1) } });
  }

  return memo;
}, []);

const SearchResult = () => {
  const results = useMemo(() => mock, []);

  return (
    <div className="w-full h-full flex flex-col gap-6 p-6 overflow-auto">
      {results.map((item) => (
        <SearchItem key={item.company.id} item={item} />
      ))}
    </div>
  );
};

export default SearchResult;
