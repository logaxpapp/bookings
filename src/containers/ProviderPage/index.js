/* eslint-disable jsx-a11y/label-has-associated-control */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import PropTypes from 'prop-types';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Loader as GoogleLoader } from '@googlemaps/js-api-loader';
import css from './style.module.css';
import {
  addressText,
  currencyHelper,
  d2,
  dateUtils,
  imageColors,
  rootSelector,
} from '../../utils';
import {
  companyProps,
  serviceProps,
  timeSlotProps,
} from '../../utils/propTypes';
import { SvgButton, colors, paths } from '../../components/svg';
import { Loader, useBusyDialog } from '../../components/LoadingSpinner';
import {
  getProviderAsync,
  getServiceTimeSlotsAsync,
  removeProviderTimeSlot,
} from '../../redux/serviceProvidersSlice';
import defaultImages from '../../utils/defaultImages';
import { useBook } from '../../utils/hooks';
import GridPanel from '../../components/GridPanel';
import { useWindowSize } from '../../lib/hooks';
import { DateButton } from '../../components/Buttons';
import Header from '../Header';
import Footer from '../Footer';
import Error404 from '../Error404';
import { ReturnPolicyComponent } from '../ReturnPolicy';
import { useDialog } from '../../lib/Dialog';
import { ServicePanel } from '../Search/SearchPanel';
import { getApiKeysAsync } from '../../redux/apiKeys';
import Modal from '../../components/Modal';
import { Input } from '../../components/TextBox';

const CLOSE_WINDOW = 'close window';
const CATEGORY = 'category';
const MORE = 'more';
const RETURN_POLICY = 'return_policy';
const SEARCH = 'search';
const VIEW_IMAGES = 'view images';
const VIEW_SLOTS = 'view slots';

const weekDays = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

let loader;

const GoogleMap = ({ latitude, longitude }) => {
  const [loaded, setLoaded] = useState(false);
  const container = useRef(null);
  const dispatch = useDispatch();

  const configureMap = useCallback(async (apiKey, position) => {
    try {
      if (!loader) {
        loader = new GoogleLoader({
          apiKey,
          version: 'weekly',
          libraries: ['places'],
        });
      }

      const { Map } = await loader.importLibrary('maps');
      const { AdvancedMarkerElement } = await loader.importLibrary('marker');
      setLoaded(true);

      // eslint-disable-next-line
      const map = new Map(container.current, {
        center: position,
        zoom: 10,
        mapId: 'providerLocation',
      });

      // eslint-disable-next-line
      new AdvancedMarkerElement({
        map,
        position,
        title: 'Location',
      }, []);
    } catch {
      // No action required
    }
  }, []);

  useEffect(() => {
    if (latitude === null || longitude === null) {
      return;
    }

    dispatch(getApiKeysAsync((err, keys) => {
      if (err) {
        return;
      }

      const apiKey = keys.googleMap;
      const location = { lat: latitude, lng: longitude };

      configureMap(apiKey, location);
    }));
  }, [latitude, longitude, configureMap, dispatch]);

  if (!(latitude && longitude)) {
    return null;
  }

  return (
    <section ref={container} className={`${css.map_container} ${loaded ? css.loaded : ''}`} />
  );
};

GoogleMap.propTypes = {
  latitude: PropTypes.number,
  longitude: PropTypes.number,
};

GoogleMap.defaultProps = {
  latitude: null,
  longitude: null,
};

const officeHour = (secs) => {
  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, secs);
  let parts = date.toLocaleTimeString().split(' ');
  const ap = parts.pop();
  parts = parts[0].split(':');

  return `${parts.filter((p, idx) => idx < 2).map((p) => d2(Number.parseInt(p, 10))).join(':')} ${ap}`;
};

const ProviderReturnPolicy = ({ provider, onClose }) => {
  const [scaled, setSacled] = useState(false);

  useEffect(() => setSacled(true), []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE_WINDOW) {
      setSacled(false);
      setTimeout(onClose, 500);
    }
  }, []);

  return (
    <div className={`${css.scaler} ${scaled ? css.scaled : ''}`}>
      <div className={css.return_policy_wrap}>
        {provider.returnPolicy ? (
          <ReturnPolicyComponent
            effectiveDate={new Date(provider.returnPolicy.updatedAt).toLocaleDateString()}
            minNoticeTime={provider.returnPolicy.minNoticeTime}
            refundPercent={provider.returnPolicy.refundPercent}
            refundDelay={provider.returnPolicy.refundDelay}
            email={provider.email}
            phoneNumber={provider.phoneNumber}
          />
        ) : <ReturnPolicyComponent email={provider.email} phoneNumber={provider.phoneNumber} />}
        <SvgButton
          type="button"
          title="Close"
          name={CLOSE_WINDOW}
          color={colors.delete}
          path={paths.close}
          onClick={handleClick}
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
            width: 32,
            height: 32,
          }}
        />
      </div>
    </div>
  );
};

ProviderReturnPolicy.propTypes = {
  provider: PropTypes.shape({
    returnPolicy: PropTypes.shape({
      updatedAt: PropTypes.string,
      minNoticeTime: PropTypes.number,
      refundPercent: PropTypes.number,
      refundDelay: PropTypes.number,
    }),
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

ProviderReturnPolicy.defaultProps = {
  provider: null,
};

const serviceDisplayModes = {
  slots: 'slots',
  images: 'images',
  none: 'none',
};

const TimeSlotRow = ({ slot, onBook }) => {
  const [datetime, setDateTime] = useState({ date: '', time: '' });

  useEffect(() => {
    const date = new Date(slot.time);
    setDateTime({ date: date.toLocaleDateString(), time: date.toLocaleTimeString() });
  }, [slot, setDateTime]);

  const handleBook = useCallback(() => onBook(slot), [slot, onBook]);

  return (
    <tr>
      <td>{datetime.date}</td>
      <td>{datetime.time}</td>
      <td>
        <button
          type="button"
          className="link compact-link"
          onClick={handleBook}
        >
          Book
        </button>
      </td>
    </tr>
  );
};

TimeSlotRow.propTypes = {
  slot: timeSlotProps.isRequired,
  onBook: PropTypes.func.isRequired,
};

const TimeSlotCard = ({ slot, onBook }) => {
  const [datetime, setDateTime] = useState({ date: '', time: '' });

  useEffect(() => {
    const date = new Date(slot.time);
    setDateTime({ date: date.toLocaleDateString(), time: date.toLocaleTimeString() });
  }, [slot, setDateTime]);

  const handleBook = useCallback(() => onBook(slot), [slot, onBook]);

  return (
    <button type="button" className={`card ${css.slot_card}`} onClick={handleBook}>
      <div className="card-row">
        <span className="card-label">Date</span>
        <span>{datetime.date}</span>
      </div>
      <div className="card-row">
        <span className="card-label">Time</span>
        <span>{datetime.time}</span>
      </div>
      <div className={css.slot_card_slider}>
        Book Appointment
      </div>
    </button>
  );
};

TimeSlotCard.propTypes = {
  slot: timeSlotProps.isRequired,
  onBook: PropTypes.func.isRequired,
};

const TimeSlotsViewer = ({
  provider,
  service,
  onClose,
}) => {
  const [mini, setMini] = useState(false);
  const [date, setDate] = useState(dateUtils.toNormalizedString(new Date()));
  const [slots, setSlots] = useState([]);
  const container = useRef(null);
  const busyDialog = useBusyDialog();
  const book = useBook();
  const dispatch = useDispatch();
  const { width } = useWindowSize();

  useEffect(() => setMini(container.current.clientWidth < 320), [width, setMini]);

  useEffect(() => {
    const popup = busyDialog.show('Fetching Time Slots ...');
    dispatch(getServiceTimeSlotsAsync(service.id, date, (err, slots) => {
      if (!err) {
        setSlots(slots);
      }
      popup.close();
    }));
  }, [date, service, setSlots]);

  const handleBookSlot = useCallback((slot) => {
    const popup = busyDialog.show('Booking Appointment ...');
    book(slot, { ...service, company: provider }, (err) => {
      if (!err) {
        const key = `${date}${service.id}`;
        dispatch(removeProviderTimeSlot({ id: slot.id, key }));
        setSlots((slots) => slots.filter((s) => s.id !== slot.id));
      }
      popup.close();
    });
  }, [provider, service, date]);

  return (
    <section ref={container} className={`${css.service_container} ${mini ? css.mini : ''}`}>
      <header className={css.sub_header}>
        <div className={css.back_btn_wrap}>
          <SvgButton
            type="button"
            name={CLOSE_WINDOW}
            path={paths.back}
            title="Back To Services"
            onClick={onClose}
          />
          <h1 className={css.service_heading}>
            {`${service.name} - Available TimeSlots`}
          </h1>
        </div>
        <div className={css.slot_date_wrap}>
          <DateButton date={date} onChange={setDate} />
        </div>
      </header>
      {slots.length ? (
        <div className="table-wrap">
          {mini ? (
            <div className={`panel overflow-auto ${css.pad_bottom}`}>
              <GridPanel minimumChildWidth={180}>
                {slots.map((slot) => (
                  <div key={slot.id} className="card-center">
                    <TimeSlotCard slot={slot} onBook={handleBookSlot} />
                  </div>
                ))}
              </GridPanel>
            </div>
          ) : (
            <div className={`${css.table_card} ${css.pad_bottom}`}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <TimeSlotRow
                      key={slot.id}
                      slot={slot}
                      onBook={handleBookSlot}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className={`${css.empty_notice} ${css.center}`}>
          No Timeslots found!
        </div>
      )}
    </section>
  );
};

TimeSlotsViewer.propTypes = {
  provider: companyProps.isRequired,
  service: serviceProps.isRequired,
  onClose: PropTypes.func.isRequired,
};

const ImagesViewer = ({
  service,
  onClose,
}) => {
  const [mini, setMini] = useState(false);
  const container = useRef(null);
  const { width } = useWindowSize();

  useEffect(() => setMini(container.current.clientWidth < 320), [width, setMini]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE_WINDOW) {
      onClose();
    }
  }, [onClose]);

  return (
    <section ref={container} className={`${css.service_container} ${mini ? css.mini : ''}`}>
      <header className={css.sub_header}>
        <div className={css.back_btn_wrap}>
          <SvgButton
            type="button"
            name={CLOSE_WINDOW}
            path={paths.back}
            title="Back To Services"
            onClick={handleClick}
          />
          <h1 className={css.service_heading}>
            {service.name}
          </h1>
        </div>
      </header>
      {service.images.length ? (
        <div className={`${css.card_list_wrap} ${css.pad_bottom}`}>
          <GridPanel minimumChildWidth={240}>
            {service.images.map(({ id, url }) => (
              <div key={id} className={`${css.service_card_wrap} ${css.image_wrap}`}>
                <img
                  src={url}
                  alt={service.name}
                  className={`${css.service_card} ${css.image}`}
                />
              </div>
            ))}
          </GridPanel>
        </div>
      ) : (
        <div className={`${css.empty_notice} ${css.center}`}>
          No images found!
        </div>
      )}
    </section>
  );
};

ImagesViewer.propTypes = {
  service: serviceProps.isRequired,
  onClose: PropTypes.func.isRequired,
};

const ServiceCard2 = ({
  service,
  symbol,
  onViewImage,
  onViewSlots,
}) => {
  const [picture, setPicture] = useState();
  const [imagesCount, setImagesCount] = useState('');

  useEffect(() => {
    const { images } = service;
    if (images.length) {
      setPicture(images[Math.floor(Math.random() * images.length)].url);
    } else {
      setPicture(defaultImages.randomServiceImage());
    }

    setImagesCount(images.length);
  }, [service]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === VIEW_IMAGES) {
      onViewImage(service);
    } else if (name === VIEW_SLOTS) {
      onViewSlots(service);
    }
  }, [service, onViewImage, onViewSlots]);

  return (
    <div className={css.service_card_wrap}>
      <section
        className={`${css.service_card} ${css.service}`}
        style={{ backgroundImage: `url(${picture})` }}
      >
        <button
          type="button"
          name={VIEW_SLOTS}
          className={`${css.dimmed} ${css.view_service_time_slots_btn}`}
          onClick={handleClick}
        >
          <h1 className={css.service_name}>
            {service.name}
          </h1>
          <div className={css.view_service_time_slots_arrow_wrap}>
            <span className={css.view_service_time_slots_arrow}>
              Book An Appointment
            </span>
          </div>
          <div className={css.view_service_time_slots_price_wrap}>
            <span className={css.view_service_time_slots_price}>
              <span>
                {currencyHelper.toString(service.price, symbol)}
              </span>
            </span>
            <span className={css.view_service_time_slots_duration}>
              {dateUtils.toDuration(service.duration)}
            </span>
          </div>
        </button>
        <button
          type="button"
          name={VIEW_IMAGES}
          className={`${css.dimmed} ${css.view_service_images}`}
          onClick={handleClick}
        >
          <span className="relative">
            {`${imagesCount} image${imagesCount === 1 ? '' : 's'}`}
          </span>
        </button>
      </section>
    </div>
  );
};

ServiceCard2.propTypes = {
  service: serviceProps.isRequired,
  symbol: PropTypes.string.isRequired,
  onViewImage: PropTypes.func.isRequired,
  onViewSlots: PropTypes.func.isRequired,
};

const ProviderPage2 = ({ provider }) => {
  const [mini, setMini] = useState(false);
  const [category, setCategory] = useState(provider.serviceCategories[0]);
  const [services, setServices] = useState(null);
  const [serviceRoute, setServiceRoute] = useState({
    service: null,
    mode: serviceDisplayModes.none,
  });
  const { address, profilePicture } = useMemo(() => ({
    address: addressText(provider.address),
    profilePicture: provider.profilePicture || defaultImages.profile,
  }), [provider]);
  const container = useRef(null);
  const { width } = useWindowSize();
  const dialog = useDialog();

  useEffect(() => {
    setMini(container.current.clientWidth < 530);
  }, [width]);

  useEffect(() => {
    setServices(category ? category.services : null);
    setServiceRoute({ service: null, mode: serviceDisplayModes.none });
  }, [category]);

  const showServiceTimeSlots = useCallback((service) => setServiceRoute({
    service,
    mode: serviceDisplayModes.slots,
  }), []);

  const showServiceTImages = useCallback((service) => setServiceRoute({
    service,
    mode: serviceDisplayModes.images,
  }), []);

  const backToServices = useCallback(() => setServiceRoute({
    service: null,
    mode: serviceDisplayModes.none,
  }), []);

  const handleCategoryChange = useCallback(({ target: { name } }) => {
    const id = Number.parseInt(name, 10);
    setCategory(
      provider.serviceCategories.find((cat) => cat.id === id),
    );
  }, [provider, setCategory]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === CATEGORY) {
      const id = Number.parseInt(value, 10);
      setCategory(
        provider.serviceCategories.find((cat) => cat.id === id),
      );
    }
  }, [provider, setCategory]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === RETURN_POLICY) {
      let popup;
      const handleClose = () => popup.close();
      popup = dialog.show(<ProviderReturnPolicy provider={provider} onClose={handleClose} />);
    }
  }, []);

  return (
    <section ref={container} className={css.container}>
      <header
        className={`${css.dimmed} ${css.header} ${mini ? css.mini : ''}`}
        style={{
          backgroundImage: `url(${provider.coverImage || defaultImages.cover})`,
        }}
      >
        <div className={css.heading_wrap}>
          <h1 className={css.heading}>{provider.name}</h1>
          <span>{address}</span>
        </div>
        <div className={css.profile_picture_wrap}>
          <img
            src={profilePicture}
            className={css.profile_picture}
            alt={provider.name}
          />
        </div>
      </header>
      <div className={`${css.content} ${mini ? css.mini : ''}`}>
        {mini ? (
          <div className={css.categories_select_panel}>
            <label className={css.select_wrap} htmlFor={CATEGORY}>
              <span className={css.select_label}>Select Category</span>
              <div className="select">
                <select
                  name={CATEGORY}
                  id={CATEGORY}
                  value={(category && category.id) || ''}
                  onChange={handleValueChange}
                >
                  <option value="" disabled>--select category--</option>
                  {provider.serviceCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </label>
          </div>
        ) : (
          <div className={css.aside}>
            {provider.serviceCategories.length ? (
              <ul className={`list ${css.aside_links}`}>
                {provider.serviceCategories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      name={cat.id}
                      className={`${css.aside_link} ${category && category.id === cat.id ? css.active : ''}`}
                      onClick={handleCategoryChange}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={`${css.empty_notice} ${css.center}`}>
                No Service Categories found!
              </div>
            )}
          </div>
        )}
        <div className={css.main}>
          {serviceRoute.mode !== serviceDisplayModes.none ? (
            <>
              {serviceRoute.mode === serviceDisplayModes.images ? (
                <ImagesViewer
                  service={serviceRoute.service}
                  onClose={backToServices}
                />
              ) : (
                <TimeSlotsViewer
                  provider={provider}
                  service={serviceRoute.service}
                  onClose={backToServices}
                />
              )}
            </>
          ) : (
            <>
              {services ? (
                <>
                  {services.length ? (
                    <div className={`${css.card_list_wrap} ${css.pad_bottom}`}>
                      <GridPanel minimumChildWidth={240}>
                        {services.map((service) => (
                          <ServiceCard2
                            key={service.id}
                            service={service}
                            symbol={provider.country.currencySymbol}
                            onViewImage={showServiceTImages}
                            onViewSlots={showServiceTimeSlots}
                          />
                        ))}
                      </GridPanel>
                    </div>
                  ) : (
                    <div className={`${css.empty_notice} ${css.center}`}>
                      No Services found!
                    </div>
                  )}
                </>
              ) : (
                <div className={`${css.empty_notice} ${css.center}`}>
                  No Category Selected!
                </div>
              )}
            </>
          )}
          <div className={css.terms_wrap}>
            <button type="button" name={RETURN_POLICY} className="link compact-link" onClick={handleClick}>
              Return Policy
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

ProviderPage2.propTypes = {
  provider: companyProps.isRequired,
};

const getAbout = (provider) => `Welcome to ${provider.name}, where excellence meets innovation. Established with a passion for quality, we take pride in delivering top-notch services that exceed expectations and redefine industry standards. At ${provider.name}. We are committed to providing our clients with excellent services that make a lasting impact. With a team of dedicated professionals, we strive for excellence in every aspect of our operations.`;

const ProviderPage = ({ provider, includeHeader, includeFooter }) => {
  const profilePicture = useMemo(() => (
    provider.profilePicture || defaultImages.profile
  ), [provider]);
  const [about, setAbout] = useState({
    full: provider.aboutUs || getAbout(provider),
    text: '',
    hasMore: false,
    length: 0,
  });
  const [isAboutModalOpen, setAboutModalOpen] = useState(false);
  const businessHours = useMemo(() => weekDays.map((d) => {
    const workHour = provider.workingHours.find(({ weekday }) => weekday === d);
    if (workHour) {
      return `${officeHour(workHour.start)} - ${officeHour(workHour.end)}`;
    }

    return 'Not Set';
  }), [provider]);
  const [category, setCategory] = useState(provider.serviceCategories[0]);
  const [services, setServices] = useState(null);
  const [term, setTerm] = useState('');
  const [imageBG, setImageBG] = useState('tarnsparent');
  const {
    address,
  } = useMemo(() => ({
    address: provider.address ? addressText(provider.address) : '',
  }), [provider]);
  const { width } = useWindowSize();
  const picture = useRef();
  const aboutRef = useRef();

  useEffect(() => {
    if (!category) {
      setServices(null);
      return;
    }

    let services = category.services.map((s) => ({ ...s, company: provider }));
    if (term) {
      const termL = term.toLowerCase();
      services = services.filter((s) => s.name.toLowerCase().indexOf(termL) >= 0);
    }
    setServices(services);
  }, [category, term, provider]);

  useEffect(() => {
    if (profilePicture) {
      imageColors.getColor(profilePicture)
        .then((color) => setImageBG(color))
        .catch(() => {});
    }
  }, [profilePicture]);

  useEffect(() => {
    setAbout((about) => {
      const w = aboutRef.current.clientWidth;
      let end = 0;

      if (w < 240) {
        end = 160;
      } else if (w < 280) {
        end = 200;
      } else if (w < 350) {
        end = 250;
      } else if (w < 400) {
        end = 300;
      }

      let { length } = about.full;
      let text = about.full;
      let hasMore = false;

      if (end) {
        if (end === about.length) {
          return about;
        }

        text = text.substring(0, end);
        hasMore = true;
        length = end;
      } else if (length === about.length) {
        return about;
      }

      return {
        full: about.full,
        text,
        hasMore,
        length,
      };
    });
  }, [width]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === SEARCH) {
      setTerm(value);
    }
  }, []);

  const handleCategoryChange = useCallback(({ target: { name } }) => {
    const id = Number.parseInt(name, 10);
    setCategory(
      provider.serviceCategories.find((cat) => cat.id === id),
    );
  }, [provider, setCategory]);

  const handleClick = ({ target: { name } }) => {
    if (name === MORE) {
      setAboutModalOpen(true);
    }
  };

  return (
    <>
      {includeHeader ? <Header /> : null}
      <div className="max-w-[1200px] mx-auto">
        <section className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-16 md:max-h-[368px] max-h-max md:overflow-hidden p-6">
          <div
            className="max-h-80 md:overflow-hidden rounded-xl lg:col-span-3"
            style={{ backgroundColor: imageBG }}
          >
            <img
              ref={picture}
              src={profilePicture}
              alt={provider.name}
              className="w-full max-h-full rounded-xl"
            />
          </div>
          <div className="lg:col-span-2">
            <h1
              className="relative flex flex-col items-start gap-2 text-[#011c39] dark:text-white text-2xl md:text-4xl font-bold m-0 pb-3"
            >
              {provider.name}
            </h1>
            <p
              ref={aboutRef}
              className="text-xl font-light m-0 text-slate-600 dark:text-slate-100"
            >
              {about.text}
              {about.hasMore ? <span> ...</span> : null}
            </p>
            {about.hasMore ? (
              <div className={css.hero_controls}>
                <button type="button" name={MORE} className="link compact-link" onClick={handleClick}>
                  read more
                </button>
              </div>
            ) : null}
            <Modal
              isOpen={isAboutModalOpen}
              parentSelector={rootSelector}
              onRequestClose={() => setAboutModalOpen(false)}
              shouldCloseOnEsc
              shouldCloseOnOverlayClick
            >
              <p className="p-8 text-lg text-slate-600 dark:text-slate-100">
                {about.full}
              </p>
            </Modal>
          </div>
        </section>
        <div className="relative w-full max-w-[1300px] mx-auto flex gap-6 p-6">
          <aside className="w-80 sticky top-0 flex flex-col gap-6 bg-[#e8eaed] dark:bg-[#1a222c] dark:text-slate-100">
            {provider.location ? (
              <GoogleMap
                latitude={provider.location.latitude}
                longitude={provider.location.longitude}
              />
            ) : null}
            <div className="p-4 flex flex-col gap-6">
              <section>
                <h1 className="text-base mb-2">Contact Info</h1>
                <div className="flex flex-col gap-4 p-1">
                  <div className={`${css.contact_row} ${css.address}`}>{address}</div>
                  <div className={`${css.contact_row} ${css.phone}`}>{provider.phoneNumber}</div>
                </div>
              </section>
              <section>
                <h1 className="text-base mb-2">Business Hours</h1>
                <div className="flex flex-col gap-6">
                  {weekDays.map((d, idx) => (
                    <div key={d} className="flex items-center">
                      <span className="w-30 capitalize">{d}</span>
                      <span>{businessHours[idx]}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </aside>
          <section className="flex-1 flex flex-col gap-6 max-h-[800px] overflow-hidden dark:text-white">
            <section>
              <h1 className="text-base mb-2">Service Categories</h1>
              {provider.serviceCategories.length ? (
                <nav>
                  <ul className="rounded-lg border border-dotted border-[#ededed] dark:border-slate-700 flex flex-wrap list-none m-0 p-1.5 max-h-30 overflow-auto gap-2">
                    {provider.serviceCategories.map((cat) => (
                      <li key={cat.id}>
                        <button
                          type="button"
                          name={cat.id}
                          className={`bg-transparent border rounded-lg py-0.5 px-1.5 text-xs cursor-pointer ${category && category.id === cat.id ? 'text-[#0fad71] border-[#0fad71]' : 'text-[#888] dark:text-slate-300 border-[#888] dark:border-slate-300'}`}
                          onClick={handleCategoryChange}
                        >
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : (
                <div className={`${css.empty_notice} ${css.center}`}>
                  No Service Categories found!
                </div>
              )}
            </section>
            <header className="flex items-center justify-between gap-6 pb-4 mb-2 border-b border-dotted border-[#ededed] dark:border-slate-600">
              <h1 className={css.services_heading}>Services</h1>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <div className="relative">
                <Input
                  type="search"
                  name={SEARCH}
                  id={SEARCH}
                  className="!pl-10"
                  placeholder="Search Services"
                  onChange={handleValueChange}
                />
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 dark:text-slate-400"
                />
              </div>
            </header>
            <div>
              {services ? (
                <>
                  {services.length ? (
                    <ul className="flex flex-wrap gap-8 m-0 p-0 list-none">
                      {services.map((service) => (
                        <li
                          key={service.id}
                          className="w-max p-5 rounded-xl border border-slate-300 dark:border-slate-600"
                        >
                          <ServicePanel service={service} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={`${css.empty_notice} ${css.center}`}>
                      No Services found!
                    </div>
                  )}
                </>
              ) : (
                <div className={`${css.empty_notice} ${css.center}`}>
                  No Category Selected!
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      {includeFooter ? (
        <div className={css.footer}>
          <Footer />
        </div>
      ) : null}
    </>
  );
};

ProviderPage.propTypes = {
  provider: companyProps.isRequired,
  includeHeader: PropTypes.bool,
  includeFooter: PropTypes.bool,
};

ProviderPage.defaultProps = {
  includeHeader: false,
  includeFooter: false,
};

export const CompanyPage = () => {
  const [busy, setBusy] = useState(true);
  const [provider, setProvider] = useState(null);
  const params = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const { code } = params;
    let id;
    if (code) {
      if (code.match(/^[0-9]+$/)) {
        id = Number.parseInt(code, 10);
      } else if (code.match(/^A[0-9]+$/)) {
        // Our codes is generated from ids by adding 1000 - we want our codes to start from 1001
        id = Number.parseInt(code.substring(1), 10) - 1000;
      }
    }

    if (!id || id <= 0) {
      setBusy(false);
      return;
    }

    dispatch(getProviderAsync(id, (err, provider) => {
      if (!err) {
        setProvider(provider);
      }
      setBusy(false);
    }));
  }, []);

  if (busy) {
    return (
      <div className="container">
        <Header />
        <div className="relative panel">
          <Loader type="double_ring">
            <span className="busy-label">Loading provider ...</span>
          </Loader>
        </div>
      </div>
    );
  }

  if (provider) {
    return <ProviderPage provider={provider} includeHeader includeFooter />;
  }

  return <Error404 />;
};

export default ProviderPage;
