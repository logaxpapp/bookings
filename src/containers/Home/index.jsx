/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable no-nested-ternary */
import {
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import QrScanner from 'qr-scanner';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../Header';
import css from './style.module.css';
import searchImage from '../../assets/images/search.jpg';
import barber from '../../assets/images/barber.jpg';
import phone from '../../assets/images/phone.jpg';
import routes from '../../routing/routes';
import { Testimonial, TrustedBy } from './TrustAndTestimonials';
import Subscriptions from './SubscriptionPlans';
import BlendedImageBackground from '../../components/BlendedImageBackground';
import Footer from '../Footer';
import FrequentQuestions from './FrequentQuestions';
import heroVideo from '../../assets/images/hero-video.mp4';
import Modal from '../../components/Modal';
import { loadCountriesAsync, selectCountries } from '../../redux/countriesSlice';
import { useUserLocation } from '../../redux/userLocationSlice';
import { notification } from '../../utils';
import { cityProps } from '../../utils/propTypes';
import PublicRouteContainer from '../PublicRouteContainer';
import Recommended from './Recommended';

const CITY = 'city';
const COUNTRY = 'country';
const OPEN_CITY_SELECT = 'open_city_select';
const STATE = 'state';
const TERM = 'term';
const SEARCH_PROMPT_BTN = 'search_prompt_btn';
const SCAN_BTN = 'scan_btn';
const TOGGLE_SEARCH_MODE = 'toggle_search_mode';

const reasons = [
  {
    id: 'easy',
    title: 'Easy Scheduling',
    text: 'Effortlessly book appointments with our intuitive and user-friendly interface.',
  },
  {
    id: 'mobile',
    title: 'Mobile-Friendly',
    text: 'Access and manage your appointments on-the-go with our responsive design that works on any device.',
  },
  {
    id: 'secure',
    title: 'Secure Platform',
    text: 'Keep your data safe with our secure infrastructure and privacy-focused features.',
  },
];

const popularSearches = [
  'Braiding', 'Make Up', 'Barber', 'Car Washer', 'House Cleaner',
];

const CodeReader = () => {
  const videoRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new QrScanner(videoRef.current, (result) => {
      const { data } = result;
      if (data) {
        scanner.stop();

        const url = new URL(data);
        navigate(url.pathname);
      }
    }, { returnDetailedScanResult: true });
    scanner.start();
    return () => scanner.stop();
  }, []);

  return (
    <div className={css.video_bg}>
      <video ref={videoRef} className={css.video} />
    </div>
  );
};

const searchModes = {
  NONE: 'none',
  CITY_SEARCH: 'city search',
  LOCATION_SEARCH: 'location search',
  CITY_SELECT: 'city select',
};

const SearchBar = ({
  city,
  mode,
  setCity,
  setMode,
}) => {
  const countries = useSelector(selectCountries);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [term, setTerm] = useState('');
  const initialized = useRef(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useUserLocation();

  const [scannerOpen, setScannerOpen] = useState(false);

  const handleClick = ({ target: { name } }) => {
    if (name === SCAN_BTN) {
      setScannerOpen(true);
    } else if (name === SEARCH_PROMPT_BTN) {
      setMode(searchModes.CITY_SEARCH);
    } else if (name === TOGGLE_SEARCH_MODE) {
      if (mode === searchModes.CITY_SEARCH) {
        setMode(searchModes.LOCATION_SEARCH);
      } else if (mode === searchModes.LOCATION_SEARCH) {
        setMode(searchModes.CITY_SEARCH);
      }
    } else if (name === OPEN_CITY_SELECT) {
      setMode(searchModes.CITY_SELECT);
    }
  };

  useEffect(() => {
    if (!countries) {
      dispatch(loadCountriesAsync(() => {}));
    }
  }, []);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    if (countries && location && !city) {
      initialized.current = true;
      const country = countries.find(
        ({ code }) => code.toLowerCase() === location.country.toLowerCase(),
      );
      if (country) {
        setCountry(country);

        const state = country.states.find(
          ({ name }) => name.toLowerCase() === location.region.toLowerCase(),
        );
        if (state) {
          setState(state);

          const city = state.cities.find(
            ({ name }) => name.toLowerCase() === location.city.toLowerCase(),
          );
          if (city) {
            setCity(city);
          }
        }
      }
    }
  }, [city, location, countries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!term) {
      notification.showInfo('Please enter a service!');
      return;
    }

    let path = `${routes.search}?term=${term}`;
    if (mode === searchModes.CITY_SEARCH) {
      if (!city) {
        notification.showError('Please select a city!');
        return;
      }

      path += `&city_id=${city.id}`;
    } else {
      path += '&force_current_location=true';
    }

    navigate(path);
  };

  const handleValueChange = ({ target: { name, value } }) => {
    if (name === COUNTRY) {
      const country = countries && countries.find(
        ({ id }) => id === Number.parseInt(value, 10),
      );
      setCountry(country);
      setState(country ? country.states[0] : null);
    } else if (name === STATE) {
      setState(
        country ? country.states.find(
          ({ id }) => id === Number.parseInt(value, 10),
        ) : null,
      );
    } else if (name === CITY) {
      setCity(
        state ? state.cities.find(
          ({ id }) => id === Number.parseInt(value, 10),
        ) : null,
      );
    } else if (name === TERM) {
      setTerm(value);
    }
  };

  return (
    <div className={css.hero_search_wrap} id="hero-search-wrap">
      <button
        type="button"
        name={SEARCH_PROMPT_BTN}
        className={css.hero_search_btn}
        onClick={handleClick}
      >
        <span className="no-pointers">Search services here ...</span>
      </button>
      <button
        aria-label="scan qr code"
        type="button"
        name={SCAN_BTN}
        className={css.hero_scan_btn}
        onClick={handleClick}
      />
      <Modal
        isOpen={mode !== searchModes.NONE}
        onRequestClose={() => setMode(searchModes.NONE)}
        parentSelector={() => document.querySelector('#hero-search-wrap')}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <div className="modal-bold-body">
          {mode === searchModes.CITY_SEARCH || mode === searchModes.LOCATION_SEARCH ? (
            <>
              {mode === searchModes.CITY_SEARCH ? (
                <button
                  type="button"
                  name={OPEN_CITY_SELECT}
                  className={`${css.city_prompt} ${css.link}`}
                  onClick={handleClick}
                >
                  {city ? (
                    <>
                      <span>
                        {`You are searching in ${city.name}, ${state.name}, ${country.name}.`}
                      </span>
                      <span>Not your city? Click to change location.</span>
                    </>
                  ) : <span>Please click to select your city</span>}
                </button>
              ) : (
                <div className={css.city_prompt}>
                  <span>You are searching by your device current location.</span>
                  <span>Please allow location access if prompted!</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className={css.city_select_form}>
                <input
                  type="search"
                  name={TERM}
                  placeholder="Enter Service"
                  value={term}
                  className={css.city_select_input}
                  onChange={handleValueChange}
                />
                <button type="submit" className={css.search_modal_btn}>
                  Search
                </button>
              </form>
              <button
                type="button"
                name={TOGGLE_SEARCH_MODE}
                className={`link ${css.search_modal_link}`}
                onClick={handleClick}
              >
                {mode === searchModes.CITY_SEARCH ? (
                  <>
                    <span>Use device location.</span>
                    <span>Please allow location access if prompted!</span>
                  </>
                ) : 'Search in my city instead.'}
              </button>
            </>
          ) : null}
          {mode === searchModes.CITY_SELECT ? (
            <>
              <label htmlFor={COUNTRY} className="bold-select-wrap">
                <span className="label">Select Country</span>
                <div className="bold-select">
                  <select
                    name={COUNTRY}
                    value={(country && country.id) || ''}
                    onChange={handleValueChange}
                  >
                    <option value="" disabled>-- Select Country --</option>
                    {countries ? countries.map((country) => (
                      <option value={country.id} key={country.id}>{country.name}</option>
                    )) : null}
                  </select>
                </div>
              </label>
              <label htmlFor={STATE} className="bold-select-wrap">
                <span className="label">Select State</span>
                <div className="bold-select">
                  <select
                    name={STATE}
                    value={(state && state.id) || ''}
                    onChange={handleValueChange}
                  >
                    <option value="" disabled>-- Select State --</option>
                    {country ? country.states.map((state) => (
                      <option value={state.id} key={state.id}>{state.name}</option>
                    )) : null}
                  </select>
                </div>
              </label>
              <label htmlFor={CITY} className="bold-select-wrap">
                <span className="label">Select City</span>
                <div className="bold-select">
                  <select
                    name={CITY}
                    value={(city && city.id) || ''}
                    onChange={handleValueChange}
                  >
                    <option value="" disabled>-- Select City --</option>
                    {state ? state.cities.map((city) => (
                      <option value={city.id} key={city.id}>{city.name}</option>
                    )) : null}
                  </select>
                </div>
              </label>
              <div className={css.search_modal_panel}>
                <button
                  type="button"
                  className={`link ${css.search_modal_link}`}
                  onClick={() => setMode(searchModes.CITY_SEARCH)}
                >
                  Search In Selected City
                </button>
                <span>OR</span>
                <button
                  type="button"
                  className={`link ${css.search_modal_link}`}
                  onClick={() => setMode(searchModes.LOCATION_SEARCH)}
                >
                  Search using device Location
                </button>
              </div>
            </>
          ) : null}
        </div>
      </Modal>
      <Modal
        isOpen={scannerOpen}
        onRequestClose={() => setScannerOpen(false)}
        parentSelector={() => document.querySelector('#hero-search-wrap')}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        {scannerOpen ? (
          <div className={css.scanner_wrap}>
            <CodeReader />
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

SearchBar.propTypes = {
  city: cityProps,
  mode: PropTypes.string.isRequired,
  setCity: PropTypes.func.isRequired,
  setMode: PropTypes.func.isRequired,
};

SearchBar.defaultProps = {
  city: null,
};

const HeroSection = () => {
  const [mode, setMode] = useState(searchModes.NONE);
  const [city, setCity] = useState();
  const navigate = useNavigate();

  const handlePopularSearchClick = ({ target: { name } }) => {
    let path = `${routes.search}?term=${name}`;
    if (city && mode !== searchModes.LOCATION_SEARCH) {
      if (!city) {
        notification.showError('Please select a city!');
        return;
      }

      path += `&city_id=${city.id}`;
    } else {
      path += '&force_current_location=true';
    }

    navigate(path);
  };

  return (
    <>
      <div
        className={css.hero_section}
      >
        {/* eslint-disable jsx-a11y/media-has-caption */}
        <video className={css.hero_video} autoPlay loop muted>
          <source src={heroVideo} />
        </video>
        {/* eslint-enable jsx-a11y/media-has-caption */}
        <div className={css.hero_inner}>
          <Header transparent />
          <section className={css.hero_body}>
            <header className={css.hero_body_header}>
              <h1 className={css.hero_heading}>
                <span>Find Your Perfect&nbsp;</span>
                <div aria-hidden="true" className="block sm:hidden" />
                <span>Services Today</span>
              </h1>
              <p className={css.hero_heading_rider}>
                Discover top-notch service providers near you.
              </p>
            </header>
            <SearchBar city={city} mode={mode} setCity={setCity} setMode={setMode} />
            <div className={css.hero_popular_search_wrap}>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  name={term}
                  className={css.hero_popular_search_btn}
                  onClick={handlePopularSearchClick}
                >
                  {term}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
      <div className="py-6 px-3 grid grid-cols-3 gap-3 sm:hidden">
        {popularSearches.map((term) => (
          <button
            key={term}
            type="button"
            name={term}
            className={css.hero_popular_search_btn}
            onClick={handlePopularSearchClick}
          >
            {term}
          </button>
        ))}
        <button
          type="button"
          aria-label="more"
          name="more"
          className={`${css.hero_popular_search_btn} flex items-center justify-center gap-2 !rounded-full`}
          onClick={handlePopularSearchClick}
        >
          <span>More</span>
          <ArrowRightIcon aria-hidden="true" className="w-4.5" />
        </button>
      </div>
    </>
  );
};

const Steps = () => (
  <section className={`${css.section_row} ${css.steps_row}`}>
    <span className={css.section_intro}>
      Our easy steps
    </span>
    <h1 className={css.section_heading}>
      How LogaXP works
    </h1>
    <div className={css.steps_body}>
      <div className={css.steps_left}>
        <article className={css.steps_article}>
          <h1 className={css.steps_article_heading}>
            Register your business
          </h1>
          <p className={css.steps_article_text}>
            Share your aspirations, work-history, & personality.
            Answer prompts to show-case your unique self.
          </p>
        </article>
        <article className={css.steps_article}>
          <h1 className={css.steps_article_heading}>
            Setup how you receive payments
          </h1>
          <p className={css.steps_article_text}>
            You choose if and how you receive money from your clients
            through our platform. We integrated an array of choice
            gateway services to choose from.
          </p>
        </article>
        <article className={css.steps_article}>
          <h1 className={css.steps_article_heading}>
            Create and manage your time slots
          </h1>
          <p className={css.steps_article_text}>
            Let your potential clients know the times that you are
            available for appointments.
          </p>
        </article>
        <article className={css.steps_article}>
          <h1 className={css.steps_article_heading}>
            Showcase and Sell your services on the go
          </h1>
          <p className={css.steps_article_text}>
            No middle men are involved. Your clients will find you
            whereever you may be.
          </p>
        </article>
      </div>
      <div className={css.steps_right}>
        <p className={css.steps_clients_text}>
          We offer web and mobile applications designed to assist prospective
          clients in exploring and accessing your services.
        </p>
        <img alt="user search" src={searchImage} className={css.search_picture} />
      </div>
    </div>
  </section>
);

const GrowWithUs = () => (
  <section className={css.section_row}>
    <span className={css.section_intro}>Grow With Us At LogaXP</span>
    <h1 className={css.section_heading}>
      We&apos;re helping businesses like yours
    </h1>
    <div className={css.service_row}>
      <BlendedImageBackground
        imageClass={`${css.img} ${css.first}`}
        containerClass={`${css.img_wrap} ${css.first}`}
        src={barber}
        alt="service"
      />
      <div className={`${css.text} ${css.light_blue} ${css.last}`}>
        <span className={css.pre_text}>
          Logaxp for Businessess
        </span>
        <h2 className={css.heading}>
          Boost Your Sales and Expand Your Reach!
        </h2>
        <p className={css.text_body}>
          Are you looking to grow your business and increase your sales?
          Take advantage of our platform to reach a wider audience
          and elevate your business to new heights!
        </p>
        <div className={css.service_row_footer}>
          <Link to={routes.company.absolute.registration} className={css.join_link}>
            Join as a Business
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const SubscriptionPanel = () => (
  <section className={css.section_row}>
    <span className={css.section_intro}>Subscription</span>
    <h2 className={css.section_heading}>
      Find the perfect plan for your business
    </h2>
    <Subscriptions />
    <div className="flex justify-center pt-6">
      <Link
        to={routes.pricing}
        className="flex items-center justify-center gap-4 py-2 px-8 rounded-full bg-green-500"
      >
        <span className="text-white">View All</span>
        <ArrowRightIcon aria-hidden="true" className="w-6 text-white" />
      </Link>
    </div>
  </section>
);

const FindServices = () => (
  <section className={css.section_row}>
    <span className={css.section_intro} style={{ display: 'none' }}>
      Grow With Us At LogaXP
    </span>
    <h1 className={css.section_heading} style={{ display: 'none' }}>
      We&apos;re helping businesses like yours
    </h1>
    <div className={`${css.service_row} ${css.flip}`}>
      <BlendedImageBackground
        imageClass={`${css.img} ${css.first}`}
        containerClass={`${css.img_wrap} ${css.first}`}
        src={phone}
        alt="service"
      />
      <div className={`${css.text} ${css.light_yellow} ${css.last}`}>
        <span className={css.pre_text}>
          Logaxp for Customers
        </span>
        <h2 className={css.heading}>
          Discover Top Service Providers Near You!
        </h2>
        <p className={css.text_body}>
          Looking for trusted service providers in your area?
          Join our community and unlock a world of reliable
          services right at your fingertips.
        </p>
        <div className={css.service_row_footer}>
          <Link to={routes.user.registeration} className={css.join_link}>
            Join as a Customer
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const WhyChooseUs = () => (
  <section className={css.section_row}>
    <span className={css.section_intro}>Why LogaXP</span>
    <h1 className={css.section_heading}>Why Choose Us</h1>
    <div className={css.reason_grid}>
      {reasons.map(({ id, title, text }) => (
        <article key={id} className={`${css.reason_panel} ${css[id]}`}>
          <h1 className={css.reason_heading}>{title}</h1>
          <p className={css.reason_text}>{text}</p>
        </article>
      ))}
    </div>
  </section>
);

const Home = () => (
  <PublicRouteContainer>
    <div className={css.container}>
      <HeroSection />
      <Recommended />
      <TrustedBy />
      <Steps />
      <WhyChooseUs />
      <GrowWithUs />
      <SubscriptionPanel />
      <FindServices />
      <Testimonial />
      <FrequentQuestions />
      <Footer />
    </div>
  </PublicRouteContainer>
);

export default Home;
