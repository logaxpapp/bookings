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
// eslint-disable-next-line
import { Loader as GoogleLoader } from '@googlemaps/js-api-loader';
import css from './style.module.css';
import {
  currencyHelper,
  d2,
  dateUtils,
  imageColors,
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
import { ServiceCard, useTimeSlotsDialog } from '../Search/SearchPanel';
import { getApiKeysAsync } from '../../redux/apiKeys';
import { useBoldDialog } from '../../components/CustomDialogs';

const CLOSE_WINDOW = 'close window';
const CATEGORY = 'category';
const MORE = 'more';
const RETURN_POLICY = 'return_policy';
const SEARCH = 'search';
const VIEW_IMAGES = 'view images';
const VIEW_SLOTS = 'view slots';

const weekDays = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
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
  });

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
  let mins = Math.floor(secs / 60);
  let hrs = Math.floor(mins / 60);
  let ap = 'AM';
  mins %= 60;
  if (hrs >= 12) {
    ap = 'PM';

    if (hrs > 12) {
      hrs %= 12;
    }
  }

  return `${d2(hrs)}:${d2(mins)}${ap}`;
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
          <span>{provider.address}</span>
        </div>
        <div className={css.profile_picture_wrap}>
          <img
            src={provider.profilePicture || defaultImages.profile}
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

const ProviderPage = ({ provider, includeHeader, includeFooter }) => {
  const profilePicture = useMemo(() => (
    provider.profilePicture || defaultImages.profile
  ), [provider]);
  const aboutUs = useMemo(() => {
    if (provider.aboutUs) {
      return provider.aboutUs;
    }

    return `Welcome to ${provider.name}, where excellence meets innovation. Established with a passion for quality, we take pride in delivering top-notch services that exceed expectations and redefine industry standards. At ${provider.name}. We are committed to providing our clients with excellent services that make a lasting impact. With a team of dedicated professionals, we strive for excellence in every aspect of our operations.`;
  }, [provider]);
  const businessHours = useMemo(() => {
    if (provider.officeHours && provider.openDays) {
      const text = `${officeHour(provider.officeHours.start)} - ${officeHour(provider.officeHours.end)}`;
      return weekDays.map((d, idx) => (provider.openDays.indexOf(idx) >= 0 ? text : 'Closed'));
    }

    return weekDays.map(() => 'Not Set');
  }, [provider]);
  const [category, setCategory] = useState(provider.serviceCategories[0]);
  const [services, setServices] = useState(null);
  const [term, setTerm] = useState('');
  const [imageBG, setImageBG] = useState('transparent');
  const [aboutHeight, setAboutHeight] = useState('100%');
  const picture = useRef();
  const heroTextWrap = useRef();
  const heroHeading = useRef();
  const boldDialog = useBoldDialog();
  const busyDialog = useBusyDialog();
  const slotsDialog = useTimeSlotsDialog();
  const book = useBook();
  const { width } = useWindowSize();

  useEffect(() => {
    const pictureHeight = picture.current.clientHeight;
    if (width >= 768 && heroTextWrap.current.clientHeight - pictureHeight >= 24) {
      setAboutHeight(pictureHeight - heroHeading.current.clientHeight);
    } else {
      setAboutHeight('100%');
    }
  }, [width]);

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
  }, [book, busyDialog, slotsDialog]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === MORE) {
      boldDialog.show(<span>{aboutUs}</span>);
    }
  }, [aboutUs, boldDialog]);

  return (
    <>
      <div>
        {includeHeader ? <Header /> : null}
        <section className={css.hero}>
          <div className={css.hero_profile_picture_wrap} style={{ backgroundColor: imageBG }}>
            <img
              ref={picture}
              src={profilePicture}
              alt={provider.name}
              className={css.hero_profile_picture}
            />
          </div>
          <div ref={heroTextWrap} className={css.hero_text_wrap}>
            <h1 ref={heroHeading} className={css.hero_heading}>{provider.name}</h1>
            <p
              className={`${css.hero_about_us} ${aboutHeight === '100%' ? '' : css.multi_line_ellipsis}`}
              style={{ height: aboutHeight }}
            >
              {aboutUs}
            </p>
            {aboutHeight === '100%' ? null : (
              <div className={css.hero_controls}>
                <button type="button" name={MORE} className="link compact-link" onClick={handleClick}>
                  read more
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
      <div className={css.body}>
        <aside className={css.body_aside}>
          {provider.location ? (
            <GoogleMap
              latitude={provider.location.latitude}
              longitude={provider.location.longitude}
            />
          ) : null}
          <div className={css.body_aside_sections}>
            <section>
              <h1 className={css.aside_heading}>Contact Info</h1>
              <div className={css.contacts_wrap}>
                <div className={`${css.contact_row} ${css.address}`}>{provider.address}</div>
                <div className={`${css.contact_row} ${css.phone}`}>{provider.phoneNumber}</div>
              </div>
            </section>
            <section>
              <h1 className={css.aside_heading}>Business Hours</h1>
              <div className={css.business_hours_panel}>
                {weekDays.map((d, idx) => (
                  <div key={d} className={css.business_hour_row}>
                    <span className={css.label}>{d}</span>
                    <span>{businessHours[idx]}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </aside>
        <section className={css.body_content}>
          <section>
            <h1 className={css.aside_heading}>Service Categories</h1>
            {provider.serviceCategories.length ? (
              <nav>
                <ul className={css.categories_list}>
                  {provider.serviceCategories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        type="button"
                        name={cat.id}
                        className={`${css.category_btn} ${category && category.id === cat.id ? css.active : ''}`}
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
          <header className={css.body_header}>
            <h1 className={css.services_heading}>Services</h1>
            <label className={css.search_wrap} htmlFor={SEARCH}>
              <input
                type="search"
                name={SEARCH}
                id={SEARCH}
                className={`transparent ${css.search}`}
                placeholder="Search Services"
                onChange={handleValueChange}
              />
            </label>
          </header>
          <div className={css.services_wrap}>
            {services ? (
              <>
                {services.length ? (
                  <div className={css.services_panel}>
                    {services.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onBook={handleBook}
                      />
                    ))}
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
          </div>
        </section>
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
