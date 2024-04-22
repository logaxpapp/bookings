import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import css from './style.module.css';
import {
  selectSearchError,
  selectSearchResults,
  selectSearching,
} from '../../redux/searchSlice';
import {
  SvgButton,
  colors,
  paths,
} from '../../components/svg';
import defaultImages from '../../utils/defaultImages';
import LoadingSpinner, { Loader, useBusyDialog } from '../../components/LoadingSpinner';
import {
  addressText,
  currencyHelper,
  d2,
  dateUtils,
  notification,
  toDuration,
  rootSelector,
} from '../../utils';
import Bookmark from '../Bookmark';
import routes from '../../routing/routes';
import { useBook, useSearch } from '../../utils/hooks';
import { getServiceTimeSlotsAsync } from '../../redux/serviceProvidersSlice';
import bg1 from '../../assets/images/barber.jpg';
import bg2 from '../../assets/images/rinse.jpg';
import bg3 from '../../assets/images/hair-spies-2.jpg';
import bg4 from '../../assets/images/manicure.jpg';
import { Ring } from '../../components/LoadingButton';
import { useDialog } from '../../lib/Dialog';
import { useWindowSize } from '../../lib/hooks';
import DatePicker from '../../components/DatePicker';
import { imageProps, timeSlotProps } from '../../utils/propTypes';
import { AccentRadioButton } from '../../components/Inputs';
import { Button } from '../../components/Buttons';
import Modal from '../../components/Modal';
import GridPanel from '../../components/GridPanel';
import BookmarkButton from '../BookmarkButton';

const BOOK = 'book';
const CLOSE_SLOTS = 'close_slots';
const DATE_INPUT = 'date_input';
const DECREMENT = 'decrement';
const INCREMENT = 'increment';
const OPEN_SLOTS = 'open_slot';
const SHOW_PICKER = 'show_picker';
const TERM = 'term';

const slides = [bg1, bg2, bg3, bg4];

const companyProps = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  profilePicture: PropTypes.string,
  address: PropTypes.shape({
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
  }),
  country: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    code: PropTypes.string,
    currency: PropTypes.string,
    currencySymbol: PropTypes.string,
  }),
});

const serviceProps = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  description: PropTypes.string,
  price: PropTypes.number,
  duration: PropTypes.number,
  minDeposit: PropTypes.number,
  images: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    url: PropTypes.string,
  })),
  company: companyProps,
});

const ServiceImagePopup = ({ images }) => {
  const [idx, setIdx] = useState(0);
  const maxIndex = useMemo(() => images.length - 1, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === INCREMENT) {
      setIdx((idx) => {
        const nIdx = idx + 1;
        if (nIdx <= maxIndex) {
          return nIdx;
        }
        return idx;
      });
    } else if (name === DECREMENT) {
      setIdx((idx) => {
        const nIdx = idx - 1;
        if (nIdx >= 0) {
          return nIdx;
        }
        return idx;
      });
    }
  }, [maxIndex]);

  return (
    <div className="dialog">
      <div className="bold-dialog-body">
        <div className={css.popup_service_image_wrap}>
          <img className={css.popup_service_image} src={images[idx].url} alt="service" />
          <nav className={css.service_image_popup_nav}>
            <SvgButton
              name={DECREMENT}
              path={paths.chevronLeft}
              style={{ width: 48, height: 48, visibility: idx > 0 ? 'visible' : 'hidden' }}
              onClick={handleClick}
            />
            <SvgButton
              name={INCREMENT}
              path={paths.chevronRight}
              style={{ width: 48, height: 48, visibility: idx < maxIndex ? 'visible' : 'hidden' }}
              onClick={handleClick}
            />
          </nav>
        </div>
      </div>
    </div>
  );
};

ServiceImagePopup.propTypes = {
  images: PropTypes.arrayOf(imageProps).isRequired,
};

const TimeSlotRow = ({ slot, activeSlot, onBook }) => {
  const [datetime, setDateTime] = useState({ date: '', time: '' });
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const date = new Date(slot.time);
    const time = date.toLocaleTimeString().split(':').filter((p, idx) => idx < 2).join(':');
    setDateTime({ date: date.toLocaleDateString(), time });
  }, [slot, setDateTime]);

  useEffect(() => {
    setDisabled(activeSlot && activeSlot.id === slot.id);
  }, [slot, activeSlot, setDisabled]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === BOOK) {
      onBook(slot);
    }
  }, [slot, onBook]);

  return (
    <button
      type="button"
      name={BOOK}
      onClick={handleClick}
      className={css.slot_btn}
      disabled={disabled}
    >
      {disabled ? (
        <Ring color="#fff" size={14} />
      ) : null}
      <span>{datetime.time}</span>
    </button>
  );
};

TimeSlotRow.propTypes = {
  slot: PropTypes.shape({
    id: PropTypes.number,
    time: PropTypes.string,
    serviceId: PropTypes.number,
  }).isRequired,
  activeSlot: PropTypes.shape({
    id: PropTypes.number,
    time: PropTypes.string,
    serviceId: PropTypes.number,
  }),
  onBook: PropTypes.func.isRequired,
};

TimeSlotRow.defaultProps = {
  activeSlot: null,
};

const TimeSlotsPanel = ({ service, onClose }) => {
  const [date, setDate] = useState(dateUtils.toNormalizedString(new Date()));
  const [slots, setSlots] = useState([]);
  const [busy, setBusy] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const dateInput = useRef(null);
  const book = useBook();
  const dispatch = useDispatch();

  const loadSlots = useCallback(() => {
    setBusy(true);
    dispatch(getServiceTimeSlotsAsync(service.id, date, (err, slots) => {
      if (err) {
        setSlots([]);
      } else {
        setSlots(slots);
      }
      setBusy(false);
    }));
  }, [date, service, setSlots]);

  useEffect(() => {
    loadSlots();
  }, [date, loadSlots]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === SHOW_PICKER) {
      dateInput.current.showPicker();
    }
  }, []);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === DATE_INPUT) {
      setDate(value);
    }
  }, []);

  const bookSlot = useCallback((slot) => {
    if (activeSlot) {
      notification.showInfo(
        'You have an active booking session on this service. Please wait for the session to complete before openning a new one',
      );
      return;
    }

    setActiveSlot(slot);

    book(slot, service, (err) => {
      setActiveSlot(null);
      if (!err) {
        setSlots(slots.filter(({ id }) => id !== slot.id));
      }
    });
  }, [service, slots, activeSlot, setSlots, setActiveSlot]);

  return (
    <section className={css.time_slots_panel}>
      <header className={css.time_slot_header}>
        <h1 className={css.time_slot_heading}>Choose A Timeslot</h1>
        <SvgButton
          type="button"
          name={CLOSE_SLOTS}
          onClick={onClose}
          title="Close"
          color={colors.delete}
          path={paths.close}
          style={{
            position: 'absolute',
            right: 4,
            top: 4,
          }}
          sm
        />
      </header>
      <div className={css.time_slot_date_btn_wrap}>
        <input
          ref={dateInput}
          type="date"
          name={DATE_INPUT}
          value={date}
          className="clip"
          onChange={handleValueChange}
        />
        <button
          type="button"
          name={SHOW_PICKER}
          className={css.time_slot_date_btn}
          onClick={handleClick}
        >
          <span className={`calendar-date-icon ${css.time_slot_date_btn_icon}`}>
            {(new Date()).getDate()}
          </span>
          <span>{new Date(date).toDateString()}</span>
        </button>
      </div>
      <div className={css.time_slots_body}>
        {slots.length ? (
          <div className={css.slots_panel}>
            {slots.map((slot) => (
              <TimeSlotRow key={slot.id} slot={slot} activeSlot={activeSlot} onBook={bookSlot} />
            ))}
          </div>
        ) : (
          <span className={`${css.empty_notice} ${css.sm} ${css.center}`}>
            No  free Timeslots found for date!
          </span>
        )}
      </div>
      {busy ? (
        <LoadingSpinner>
          <span>Loading ...</span>
        </LoadingSpinner>
      ) : null}
    </section>
  );
};

TimeSlotsPanel.propTypes = {
  service: serviceProps.isRequired,
  onClose: PropTypes.func.isRequired,
};

const TimeSlotRadio = ({
  slot,
  duration,
  checked,
  onCheck,
}) => {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const date = new Date(slot.time);
    let pa = date.getHours() < 12 ? 'AM' : 'PM';
    const time = `${date.toLocaleTimeString().split(':').filter(
      (p, idx) => idx < 2,
    ).map((p) => d2(p))
      .join(':')}${pa}`;
    date.setSeconds(date.getSeconds() + duration);
    pa = date.getHours() < 12 ? 'AM' : 'PM';
    setLabel(`${time} - ${date.toLocaleTimeString().split(':').filter(
      (p, idx) => idx < 2,
    ).map((p) => d2(p))
      .join(':')}${pa}`);
  }, [slot, duration]);

  const handleValueChange = useCallback(({ target }) => {
    if (target.checked) {
      onCheck(slot);
    }
  }, [slot, onCheck]);

  return (
    <AccentRadioButton
      name={slot.id}
      id={slot.id}
      onChange={handleValueChange}
      radioSize={20}
      label={label}
      checked={checked}
      style={{
        gap: 12,
        fontSize: 16,
        cursor: 'pointer',
      }}
    />
  );
};

TimeSlotRadio.propTypes = {
  slot: timeSlotProps.isRequired,
  duration: PropTypes.number.isRequired,
  checked: PropTypes.bool.isRequired,
  onCheck: PropTypes.func.isRequired,
};

const TimeSlotsDialog = ({ service, onSlotSelected }) => {
  const [date, setDate] = useState(dateUtils.toNormalizedString(new Date()));
  const [slots, setSlots] = useState([]);
  const [busy, setBusy] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const dispatch = useDispatch();

  const loadSlots = useCallback(() => {
    setBusy(true);
    dispatch(getServiceTimeSlotsAsync(service.id, date, (err, slots) => {
      if (err) {
        setSlots([]);
      } else {
        setSlots(slots);
      }
      setBusy(false);
    }));
  }, [date, service]);

  useEffect(() => {
    loadSlots();
  }, [date, loadSlots]);

  useEffect(() => {
    setSelectedSlot(null);
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === BOOK) {
      if (selectedSlot) {
        onSlotSelected(selectedSlot);
      } else {
        notification.showError('Please select a timeslot');
      }
    }
  }, [selectedSlot]);

  return (
    <div className={css.timeslots_panel_wrap}>
      <DatePicker initialDate={new Date()} onDateChange={setDate} />
      <section className={css.timeslots_panel}>
        <h1 className={css.time_slot_heading}>Please Select A Timeslot</h1>
        {slots.length ? (
          <>
            <div className={css.timeslots_inner_panel}>
              {slots.map((slot) => (
                <TimeSlotRadio
                  key={slot.id}
                  slot={slot}
                  duration={service.duration}
                  checked={selectedSlot === slot}
                  onCheck={setSelectedSlot}
                />
              ))}
            </div>
            <div className={css.timeslots_controls}>
              <button
                type="button"
                name={BOOK}
                className={css.book_btn}
                onClick={handleClick}
              >
                Book
              </button>
            </div>
          </>
        ) : (
          <span className={`${css.empty_notice} ${css.sm} ${css.center}`}>
            No  free Timeslots found for date!
          </span>
        )}
      </section>
      {busy ? (
        <LoadingSpinner>
          <span>Loading ...</span>
        </LoadingSpinner>
      ) : null}
    </div>
  );
};

TimeSlotsDialog.propTypes = {
  service: serviceProps.isRequired,
  onSlotSelected: PropTypes.func.isRequired,
};

export const useTimeSlotsDialog = () => {
  const dialog = useDialog();

  return {
    show: (service, callback) => {
      let popup;
      const handleClose = () => popup.close();

      popup = dialog.show(
        <div className="dialog">
          <div className="bold-dialog-body">
            <TimeSlotsDialog service={service} onSlotSelected={callback} />
            <SvgButton
              type="button"
              title="Close"
              color={colors.delete}
              path={paths.close}
              onClick={handleClose}
              style={{
                position: 'absolute',
                right: 6,
                top: 6,
              }}
            />
          </div>
        </div>,
      );

      return {
        close: handleClose,
      };
    },
  };
};

const ServicePanel2 = ({ service }) => {
  const [index, setIndex] = useState(0);
  const {
    address,
    images,
    price,
    profilePicture,
  } = useMemo(() => ({
    address: addressText(service.company.address),
    images: service.images.length
      ? service.images
      : [{ id: 0, url: defaultImages.randomServiceImage() }],
    price: currencyHelper.toString(service.price, service.company.country.currencySymbol),
    profilePicture: service.company.profilePicture || defaultImages.profile,
  }), [service]);
  const [isTimeSlotOpen, setTimeSlotOpen] = useState(false);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === INCREMENT) {
      setIndex((index) => {
        const idx = index + 1;
        return idx < images.length ? idx : index;
      });
    } else if (name === DECREMENT) {
      setIndex((index) => {
        const idx = index - 1;
        return idx >= 0 ? idx : index;
      });
    } else if (name === OPEN_SLOTS) {
      setTimeSlotOpen(true);
    } else if (name === CLOSE_SLOTS) {
      setTimeSlotOpen(false);
    }
  }, [images, setIndex, setTimeSlotOpen]);

  return (
    <section className={css.service_panel}>
      <div className={css.service_picture_wrap}>
        <img alt={service.name} src={images[index].url} className={css.service_picture} />
        <div className={css.picture_nav_wrap}>
          <nav className={css.picture_nav}>
            <button
              aria-label="decrement"
              type="button"
              name={DECREMENT}
              className={css.picture_nav_btn}
              disabled={index <= 0}
              onClick={handleClick}
            >
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d={paths.chevronLeft} />
              </svg>
            </button>
            <button
              aria-label="increment"
              type="button"
              name={INCREMENT}
              className={css.picture_nav_btn}
              disabled={index >= images.length - 1}
              onClick={handleClick}
            >
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d={paths.chevronRight} />
              </svg>
            </button>
          </nav>
        </div>
        {isTimeSlotOpen ? (
          <div className={`dimmed ${css.service_header_name}`}>
            <span className="relative">{service.name}</span>
          </div>
        ) : null}
      </div>
      <div
        aria-hidden={isTimeSlotOpen}
        className={`${css.service_details_wrap} ${isTimeSlotOpen ? css.hidden : ''}`}
      >
        <div className={css.service_details}>
          <span className={css.service_name}>{service.name}</span>
          <div className={css.service_price_wrap}>
            <span>{price}</span>
          </div>
          <Link
            className={css.service_provider_link}
            to={routes.providerPage(service.company.id)}
          >
            <div className={css.service_provider_profile_wrap}>
              <img src={profilePicture} alt={service.company.name} />
            </div>
            <div className={css.service_provider_profile_details}>
              <span className={css.service_provider_profile_name}>
                {service.company.name}
              </span>
              <span className={css.service_provider_profile_address}>
                {address}
              </span>
            </div>
          </Link>
          <div className={css.service_provider_controls}>
            <Bookmark
              company={service.company}
              size={16}
              className={css.service_provider_bookmark}
            />
          </div>
        </div>
        <div className={css.appointments_btn_wrap}>
          <button
            type="button"
            name={OPEN_SLOTS}
            className={css.appointments_btn}
            onClick={handleClick}
          >
            Book Appointment
          </button>
        </div>
      </div>
      {isTimeSlotOpen ? (
        <div
          aria-hidden={!isTimeSlotOpen}
          className={`${css.service_time_slots} ${isTimeSlotOpen ? '' : css.hidden}`}
        >
          <TimeSlotsPanel service={service} onClose={handleClick} />
        </div>
      ) : null}
    </section>
  );
};

ServicePanel2.propTypes = {
  service: serviceProps.isRequired,
};

export const ServiceCard = ({ service, onBook }) => {
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [duration, setDuration] = useState('');
  const [images, setImages] = useState([]);
  const dialog = useDialog();

  useEffect(() => {
    setPrice(currencyHelper.toString(service.price, service.company.country.currencySymbol));
    if (service.minDeposit) {
      setDeposit(currencyHelper.toString(
        service.minDeposit, service.company.country.currencySymbol,
      ));
    }
    setDuration(toDuration(service.duration));
    setImages(service.images.filter((img, idx) => idx < 2));
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === BOOK) {
      onBook(service);
    }
  }, [service]);

  const handleImageClick = useCallback(({ target: { name } }) => {
    let popup;
    const handleClose = () => popup.close();
    popup = dialog.show(
      <ServiceImagePopup
        images={service.images}
        onClose={handleClose}
        index={Number.parseInt(name, 10)}
      />,
    );
  }, [dialog]);

  return (
    <section className={css.service_card}>
      <header>
        <h1 className={css.service_name}>{service.name}</h1>
        <p className={css.service_description}>{service.description || ''}</p>
      </header>
      <div className={css.service_details}>
        <div className={css.service_detail_wrap}>
          <span className={`${css.service_detail_label} ${css.cash}`}>Price</span>
          <span className={`${css.service_value} ${css.bold}`}>{price}</span>
        </div>
        <div className={`${css.service_detail_wrap} ${css.duration}`}>
          <span className={`${css.service_detail_label} ${css.duration}`}>Duration</span>
          <span className={`${css.service_value} ${css.thin}`}>{duration}</span>
        </div>
        <div className={css.service_detail_wrap}>
          <span className={`${css.service_detail_label} ${css.cash}`}>Deposit</span>
          <span className={css.service_value}>{deposit}</span>
        </div>
      </div>
      <div className={css.service_card_controls}>
        <div className={css.service_image_wrap}>
          {images.length ? images.map((image, idx) => (
            <button
              type="button"
              key={image.id}
              className={css.service_image_btn}
              name={idx}
              onClick={handleImageClick}
            >
              <img src={image.url} alt="p" className={css.service_image} />
            </button>
          )) : null}
        </div>
        <div className={css.book_btn_wrap}>
          <button type="button" className={css.book_btn} name={BOOK} onClick={handleClick}>
            Book
          </button>
        </div>
      </div>
    </section>
  );
};

ServiceCard.propTypes = {
  service: serviceProps.isRequired,
  onBook: PropTypes.func.isRequired,
};

const CompanyServicesPanel = ({ companyServices }) => {
  // const [profilePicture, setProfilePicture] = useState('');
  const { address, profilePicture } = useMemo(() => ({
    address: addressText(companyServices.company.address),
    profilePicture: companyServices.company.profilePicture || defaultImages.profile,
  }), [companyServices]);
  const busyDialog = useBusyDialog();
  const slotsDialog = useTimeSlotsDialog();
  const book = useBook();

  const handleBook = useCallback((service) => {
    const popup = slotsDialog.show(service, (slot) => {
      const busyPopup = busyDialog.show('Waiting for payment completion ...');
      book(slot, service, (err) => {
        if (!err) {
          popup.close();
        }
        busyPopup.close();
      });
    });
  }, [book, busyDialog]);

  return (
    <section className={css.company_services_panel}>
      <header className={css.company_services_header}>
        <Link
          to={routes.providerPage(companyServices.company.id)}
          title={companyServices.company.name}
        >
          <div className={css.company_picture_wrap}>
            <img
              src={profilePicture}
              alt={companyServices.company.name}
              className={css.company_services_picture}
            />
          </div>
          <h1 className={css.company_services_heading}>{companyServices.company.name}</h1>
          <p className={css.company_address}>
            <span>{address}</span>
          </p>
        </Link>
      </header>
      <div className={css.company_services}>
        {companyServices.services.map((service) => (
          <ServiceCard key={service.id} service={service} onBook={handleBook} />
        ))}
      </div>
    </section>
  );
};

CompanyServicesPanel.propTypes = {
  companyServices: PropTypes.shape({
    company: companyProps,
    services: PropTypes.arrayOf(serviceProps),
  }).isRequired,
};

const PlaceHolder = ({ initialTerm, onSearch }) => {
  const [term, setTerm] = useState(initialTerm);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let handle;
    const loop = () => {
      handle = setTimeout(() => {
        setIndex((index) => {
          let idx = index + 1;
          if (idx >= slides.length) {
            idx = 0;
          }

          return idx;
        });
        loop();
      }, 5000);
    };

    loop();
    return () => clearTimeout(handle);
  }, []);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === TERM) {
      setTerm(value);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (term) {
      onSearch(term);
    }
  }, [term]);

  return (
    <div className={css.error_panel} style={{ backgroundImage: `url(${slides[index]})` }}>
      <div className={css.error_dimmer} />
      <div className={css.error_inner}>
        <form className={css.search_form} onSubmit={handleSubmit}>
          <input
            type="search"
            name={TERM}
            className={css.search_input}
            onChange={handleValueChange}
            placeholder="What are you looking for?"
          />
          <button
            aria-label="search"
            type="submit"
            className={css.search_btn}
          >
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d={paths.magnify} />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

PlaceHolder.propTypes = {
  initialTerm: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
};

PlaceHolder.defaultProps = {
  initialTerm: '',
};

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

export const SlotsPanel = ({
  service,
  address,
  price,
  deposit,
  duration,
  panelWidth,
  setPanelWidth,
  busy,
  setBusy,
  onSlotSelected,
}) => {
  const [date, setDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const panelRef = useRef(null);
  const { width } = useWindowSize();
  const dispatch = useDispatch();

  const loadSlots = useCallback((date) => {
    setBusy(true);
    dispatch(getServiceTimeSlotsAsync(service.id, date, (err, slots) => {
      if (err) {
        setSlots([]);
      } else {
        setSlots(slots);
      }
      setBusy(false);
    }));
  }, [date, service]);

  useEffect(() => {
    loadSlots(date);
  }, []);

  const handleDateChange = (date) => {
    setDate(date);
    setSelectedSlot(null);
    setSlots([]);
    loadSlots(date);
  };

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

  const bookSlot = () => {
    if (!selectedSlot) {
      notification.showError(
        'Please select a timeslot to proceed!',
      );
      return;
    }

    onSlotSelected(selectedSlot);
  };

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
            <DatePicker initialDate={date} onDateChange={handleDateChange} />
          </div>
        </div>
        {isLarge ? (
          <div className="flex flex-col gap-2 h-full overflow-y-auto overflow-x-hidden pr-0.5">
            {slots.map((slot) => (
              <SlotButton
                key={slot.id}
                slot={slot}
                selectedSlot={selectedSlot}
                onSelected={setSelectedSlot}
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
                  onSelected={setSelectedSlot}
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
            onClick={bookSlot}
            busy={busy}
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
  busy: PropTypes.bool,
  setBusy: PropTypes.func.isRequired,
  onSlotSelected: PropTypes.func.isRequired,
};

SlotsPanel.defaultProps = {
  address: '',
  deposit: '',
  panelWidth: 750,
  busy: false,
};

export const ServicePanel = ({ service }) => {
  const [slotsModalState, setSlotsModalState] = useState({ busy: false, isOpen: false });
  const [isImagesModalOpen, setImagesModalOpen] = useState(false);
  const {
    address,
    price,
    deposit,
    duration,
    images,
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
  }, [service]);
  const [panelWidth, setPanelWidth] = useState(750);
  const book = useBook();

  const handleBook = (slot) => {
    setSlotsModalState({ isOpen: true, busy: true });
    book(slot, service, (err) => {
      if (!err) {
        setSlotsModalState({ isOpen: false, busy: false });
      } else {
        setSlotsModalState({ isOpen: true, busy: false });
      }
    });
  };

  return (
    <section className="flex flex-col gap-2.5">
      <header className="w-full max-w-[490px] flex items-center gap-2">
        {images.length ? (
          <button
            type="button"
            aria-label="view pictures"
            title="View Pictures"
            className="outline-none border-none p-1 bg-transparent cursor-pointer"
            onClick={() => setImagesModalOpen(true)}
          >
            <ArrowUpOnSquareIcon className="w-4.5 h-4.5 text-[#5c5c5c] dark:text-white" />
          </button>
        ) : null}
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
          <Button type="button" onClick={() => setSlotsModalState({ busy: false, isOpen: true })}>
            Book
          </Button>
        </div>
      </div>
      <Modal
        isOpen={slotsModalState.isOpen || slotsModalState.busy}
        parentSelector={rootSelector}
        onRequestClose={() => {
          if (!slotsModalState.busy) {
            setSlotsModalState({ busy: false, isOpen: false });
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
          busy={slotsModalState.busy}
          setBusy={(busy) => setSlotsModalState((state) => ({ ...state, busy }))}
          onSlotSelected={handleBook}
        />
      </Modal>
      {images.length ? (
        <Modal
          isOpen={isImagesModalOpen}
          parentSelector={rootSelector}
          onRequestClose={() => setImagesModalOpen(false)}
          shouldCloseOnEsc
          shouldCloseOnOverlayClick
        >
          <ServiceImagePopup images={images} />
        </Modal>
      ) : null}
    </section>
  );
};

ServicePanel.propTypes = {
  service: serviceProps.isRequired,
};

const SearchItemPanel = ({ item }) => {
  const [address, picture, url] = useMemo(() => [
    addressText(item.company.address),
    item.company.profilePicture || defaultImages.profile,
    window.location.pathname.includes('users')
      ? routes.user.dashboard.absolute.providers(item.company.id)
      : routes.providerPage(`A${1000 + item.company.id}`),
  ], []);

  return (
    <div className="w-full flex gap-4 max-h-75 overflow-hidden">
      <Link
        className="flex-1 max-h-full"
        to={url}
      >
        <img className="rounded w-full max-h-full" src={picture} alt={item.company.name} />
      </Link>
      <section className="px-5 pb-2 dark:bg-boxdark flex-1 flex flex-col gap-6 h-full overflow-hidden">
        <header className="flex flex-col gap-4">
          <div className="w-full max-w-125 flex items-center justify-between">
            <h1
              title={item.company.name}
              className="m-0  text-2xl font-bold tracking-tight text-[#011c39] dark:text-white flex-1 text-ellipsis whitespace-nowrap"
            >
              {item.company.name}
            </h1>
            <BookmarkButton company={item.company} />
          </div>
          <p className="m-0 font-normal text-[#011c39] dark:text-gray">
            {address}
          </p>
        </header>
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-6">
          {item.services.map((service) => (
            <ServicePanel key={service.id} service={service} />
          ))}
        </div>
      </section>
    </div>
  );
};

SearchItemPanel.propTypes = {
  item: PropTypes.shape({
    company: companyProps,
    services: PropTypes.arrayOf(serviceProps),
  }).isRequired,
};

const SearchPanel = ({ term, cityId, forceCurrentLocation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const results = useSelector(selectSearchResults);
  const error = useSelector(selectSearchError);
  const loading = useSelector(selectSearching);
  const search = useSearch();

  useEffect(() => {
    if (term) {
      setSearchTerm(term);
    }
  }, [term]);

  useEffect(() => {
    if (searchTerm) {
      search(searchTerm, cityId, forceCurrentLocation);
    }
  }, [searchTerm, cityId, forceCurrentLocation, search]);

  useEffect(() => {
    const services = results.reduce((memo, item) => {
      const service = memo.find((s) => s.company.id === item.company.id);
      if (service) {
        return memo.map((s) => (
          s.company.id === item.company.id ? { ...s, services: [...s.services, item] } : s
        ));
      }
      return [...memo, { company: item.company, services: [item] }];
    }, []);

    setServices(services);
  }, [results]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  /* eslint-disable no-nested-ternary */
  return (
    <section className="relative flex-1 p-8 w-full max-w-[1300px] mx-auto">
      {loading ? (
        <Loader type="double_ring">
          <span style={{ color: '#354764' }}>
            {`Searching for ${term} ...`}
          </span>
        </Loader>
      ) : error || !searchTerm ? (
        <PlaceHolder initialTerm={term} error={error} onSearch={handleSearch} />
      ) : services.length ? (
        <div className="w-full flex flex-col gap-6 p-6 bg-white dark:bg-[#24303f]">
          {services.map((service) => (
            <SearchItemPanel key={service.company.id} item={service} />
          ))}
        </div>
      ) : (
        <p className="font-bold text-xl text-[#858b9c] dark:text-[#ccc] pt-8 flex flex-col items-center gap-4">
          <span>We couldn&apos;t find any services that matched your search parameters.</span>
          <span>Please try again using different search terms.</span>
        </p>
      )}
    </section>
  );
  /* eslint-enable no-nested-ternary */
};

SearchPanel.propTypes = {
  term: PropTypes.string,
  cityId: PropTypes.number,
  forceCurrentLocation: PropTypes.bool,
};

SearchPanel.defaultProps = {
  term: null,
  cityId: null,
  forceCurrentLocation: false,
};

export default SearchPanel;
