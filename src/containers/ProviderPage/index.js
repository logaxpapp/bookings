import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import PropTypes from 'prop-types';
import css from './style.module.css';
import { currencyHelper, dateUtils } from '../../utils';
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
import Error404 from '../Error404';
import { ReturnPolicyComponent } from '../ReturnPolicy';
import { useDialog } from '../../lib/Dialog';

const CLOSE_WINDOW = 'close window';
const CATEGORY = 'category';
const RETURN_POLICY = 'return_policy';
const VIEW_IMAGES = 'view images';
const VIEW_SLOTS = 'view slots';

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

const ServiceCard = ({
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

ServiceCard.propTypes = {
  service: serviceProps.isRequired,
  symbol: PropTypes.string.isRequired,
  onViewImage: PropTypes.func.isRequired,
  onViewSlots: PropTypes.func.isRequired,
};

const ProviderPage = ({ provider }) => {
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
                          <ServiceCard
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

ProviderPage.propTypes = {
  provider: companyProps.isRequired,
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
    return (
      <div className="container">
        <Header />
        <div className="relative panel">
          <ProviderPage provider={provider} />
        </div>
      </div>
    );
  }

  return <Error404 />;
};

export default ProviderPage;
