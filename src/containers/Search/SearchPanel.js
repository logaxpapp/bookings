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
import css from './style.module.css';
import {
  selectSearchError,
  selectSearchResults,
  selectSearching,
} from '../../redux/searchSlice';
import {
  CloseSvgButton,
  SvgButton,
  colors,
  paths,
} from '../../components/svg';
import defaultImages from '../../utils/defaultImages';
import LoadingSpinner, { Loader, useBusyDialog } from '../../components/LoadingSpinner';
import {
  currencyHelper,
  d2,
  dateUtils,
  notification,
  toDuration,
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
import DatePicker from '../../components/DatePicker';
import { imageProps, timeSlotProps } from '../../utils/propTypes';
import { AccentRadioButton } from '../../components/Inputs';

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
  address: PropTypes.string,
  profilePicture: PropTypes.string,
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

const ServiceImagePopup = ({ images, index, onClose }) => {
  const [idx, setIdx] = useState(index || 0);
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
        <CloseSvgButton onClick={onClose} />
      </div>
    </div>
  );
};

ServiceImagePopup.propTypes = {
  images: PropTypes.arrayOf(imageProps).isRequired,
  onClose: PropTypes.func.isRequired,
  index: PropTypes.number,
};

ServiceImagePopup.defaultProps = {
  index: 0,
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

const ServicePanel = ({ service }) => {
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState([{
    id: 0,
    url: defaultImages.randomServiceImage(),
  }]);
  const [price, setPrice] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [isTimeSlotOpen, setTimeSlotOpen] = useState(false);

  useEffect(() => {
    if (service.images.length) {
      setImages(service.images);
    }
    setPrice(currencyHelper.toString(service.price, service.company.country.currencySymbol));
    setProfilePicture(service.company.profilePicture || defaultImages.profile);
  }, []);

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
              aria-label="decrease"
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
              aria-label="increase"
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
                {service.company.address}
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

ServicePanel.propTypes = {
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
  const [profilePicture, setProfilePicture] = useState('');
  const busyDialog = useBusyDialog();
  const slotsDialog = useTimeSlotsDialog();
  const book = useBook();

  useEffect(() => {
    setProfilePicture(companyServices.company.profilePicture || defaultImages.profile);
  }, [companyServices]);

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
            <span>{companyServices.company.address}</span>
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
            aria-label="submit"
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
    <section className={css.container}>
      {loading ? (
        <Loader type="double_ring">
          <span style={{ color: '#354764' }}>
            {`Searching for ${term} ...`}
          </span>
        </Loader>
      ) : error || !searchTerm ? (
        <PlaceHolder initialTerm={term} error={error} onSearch={handleSearch} />
      ) : services.length ? (
        <div className={css.search_results}>
          {services.map((service) => (
            <CompanyServicesPanel key={service.company.id} companyServices={service} />
          ))}
        </div>
      ) : (
        <p className={`${css.empty_notice} ${css.pad_top} ${css.empty_search_results}`}>
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
