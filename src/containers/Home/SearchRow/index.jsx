import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import QrScanner from 'qr-scanner';
import css from './style.module.css';
import homeCss from '../style.module.css';
import { loadCountriesAsync, selectCountries } from '../../../redux/countriesSlice';
import Slider from '../../../lib/Slider';
import slide1 from '../../../assets/images/hair-spies-1.jpg';
import slide2 from '../../../assets/images/manicure.jpg';
import slide3 from '../../../assets/images/hair-spies-2.jpg';
import StarRating from '../../../lib/StarRating';
import routes from '../../../routing/routes';
import { SvgButton, colors, paths } from '../../../components/svg';
import { useUserLocation } from '../../../redux/userLocationSlice';
import { useDialog } from '../../../lib/Dialog';
import { cityProps, countryProps, stateProps } from '../../../utils/propTypes';
import { notification } from '../../../utils';

const testing = true;

const CHANGE_LOCATION = 'change_location';
const CITY = 'city';
const COUNTRY = 'country';
const STATE = 'state';
const SELECT_CITY = 'select_city';
const TERM = 'term';
const USE_CITY = 'use_city';
const USE_LOCATION = 'use_location';

const commonTerms = [
  'Hairstylist', 'Barber', 'Car Washer', 'House Cleaner',
];

const slides = [
  { id: 1, alt: 'haircut', src: slide1 },
  { id: 2, alt: 'manicure', src: slide2 },
  { id: 3, alt: 'haircut', src: slide3 },
];

const searchModes = {
  city: 'city',
  location: 'location',
};

/* eslint-disable jsx-a11y/media-has-caption */

export const Slide = ({ slide }) => (
  <div className={css.slide_content}>
    <img
      className={css.slide_image}
      alt={slide.alt}
      src={slide.src}
    />
  </div>
);

Slide.propTypes = {
  slide: PropTypes.shape({
    src: PropTypes.string,
    alt: PropTypes.string,
  }).isRequired,
};

const StarRatingsPanel = () => (
  <div className={css.star_ratings_panel}>
    <StarRating width={80} rating={90} />
    <p className={css.star_ratings_text}>
      Our Customers rate us 4.5 out of 5 stars based on 1200+ reviews
    </p>
  </div>
);

const SearchForm = ({ onSearch, onScan }) => {
  const [term, setTerm] = useState('');
  const navigate = useNavigate();

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === TERM) {
      setTerm(value);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (term) {
      if (term.match(/^A[0-9]+$/)) {
        navigate(routes.providerPage(term));
        return;
      }

      onSearch(term);
    }
  }, [term, onSearch]);

  return (
    <form onSubmit={handleSubmit} className={css.search_form}>
      <input
        type="search"
        name={TERM}
        onChange={handleValueChange}
        className={css.search_input}
        placeholder="Enter Service or Provider Code"
      />
      <button type="submit" className={css.search_btn}>
        Search
      </button>
      <SvgButton
        type="button"
        title="Click to scan qrcode"
        path={paths.qrcodeScan}
        style={{ marginLeft: 4 }}
        onClick={onScan}
      />
    </form>
  );
};

SearchForm.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onScan: PropTypes.func.isRequired,
};

const CitySearchPanel = ({
  setSearchCity,
  onSearch,
  onScan,
}) => {
  const countries = useSelector(selectCountries);
  // const [initializing, setInitializing] = useState(false);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState();
  const initialized = useRef(false);
  const dispatch = useDispatch();
  const location = useUserLocation();

  const handleStateChange = useCallback((state) => {
    setState(state);
    if (state) {
      setCity(state.cities[0]);
    }
  }, []);

  useEffect(() => {
    if (!countries) {
      dispatch(loadCountriesAsync(() => {}));
    }
  }, []);

  useEffect(() => {
    if (countries) {
      setCountry((country) => country || countries[0]);
    }
  }, [countries]);

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

  useEffect(() => setSearchCity(city), [city]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === COUNTRY) {
      const country = countries.find((c) => c.id === Number.parseInt(value, 10));
      setCountry(country);
      if (country) {
        handleStateChange(country.states[0]);
      }
    } else if (name === STATE) {
      handleStateChange(country && country.states.find(
        (s) => s.id === Number.parseInt(value, 10),
      ));
    } else if (name === CITY) {
      setCity(state && state.cities.find((c) => c.id === Number.parseInt(value, 10)));
    }
  }, [countries, country, state]);

  const handleSearch = useCallback((term) => {
    if (city) {
      onSearch(term);
    }
  }, [city, onSearch]);

  return (
    <section className={css.city_search_panel}>
      {/* <button
        type="button"
        className={`link compact-link ${css.search_mode_toggle_btn}`}
        onClick={toggleSearchMode}
      >
        Search By My Location
      </button> */}
      <SearchForm onSearch={handleSearch} onScan={onScan} />
      {city ? (
        <p className={css.city_text}>
          {`You are searching in ${city.name}, ${state.name}, ${country.name}. Change below if this is not your city.`}
        </p>
      ) : null}
      <div className={css.city_search_selects_wrap}>
        <div className={css.city_search_select_wrap}>
          <label className={`select ${css.city_search_select}`} htmlFor={CITY}>
            <select
              id={CITY}
              name={CITY}
              value={(city && city.id) || ''}
              onChange={handleValueChange}
              title={city && city.name}
            >
              <option value="" disabled>--Select City--</option>
              {state && state.cities ? state.cities.map((city) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              )) : null}
            </select>
          </label>
        </div>
        <div className={css.city_search_selects_row}>
          <div className={css.city_search_select_wrap}>
            <label className={`select ${css.city_search_select}`} htmlFor={STATE}>
              <select
                id={STATE}
                name={STATE}
                value={(state && state.id) || ''}
                onChange={handleValueChange}
                title={state && state.name}
              >
                <option value="" disabled>--Select State--</option>
                {country ? country.states.map((state) => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                )) : null}
              </select>
            </label>
          </div>
          <div className={css.city_search_select_wrap}>
            <label className={`select ${css.city_search_select}`} htmlFor={COUNTRY}>
              <select
                id={COUNTRY}
                name={COUNTRY}
                value={(country && country.id) || ''}
                onChange={handleValueChange}
                title={country && country.name}
              >
                <option value="" disabled>--Select Country--</option>
                {countries ? countries.map((country) => (
                  <option key={country.id} value={country.id}>{country.name}</option>
                )) : null}
              </select>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};

CitySearchPanel.propTypes = {
  setSearchCity: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onScan: PropTypes.func.isRequired,
};

const CitySelect = ({
  city,
  state,
  country,
  countries,
  onSubmit,
  onSearch,
  onClose,
}) => {
  const [selectedCity, setSelectedCity] = useState(city);
  const [selectedState, setSelectedState] = useState(state);
  const [selectedCountry, setSelectedCountry] = useState(country);
  const [mode, setMode] = useState(searchModes.city);
  const [term, setTerm] = useState('');

  const setState = useCallback((state) => {
    setSelectedState(state);
    setSelectedCity(state ? state.cities[0] : null);
  }, []);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === COUNTRY) {
      const country = countries && countries.find(
        ({ id }) => id === Number.parseInt(value, 10),
      );
      setSelectedCountry(country);
      setState(country ? country.states[0] : null);
    } else if (name === STATE) {
      setState(
        selectedCountry ? selectedCountry.states.find(
          ({ id }) => id === Number.parseInt(value, 10),
        ) : null,
      );
    } else if (name === CITY) {
      setSelectedCity(
        selectedState ? selectedState.cities.find(
          ({ id }) => id === Number.parseInt(value, 10),
        ) : null,
      );
    } else if (name === TERM) {
      setTerm(value);
    }
  }, [countries, selectedCountry, selectedState, setState]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === USE_CITY) {
      onSubmit(selectedCity, selectedState, selectedCountry);
      onClose();
    } else if (name === SELECT_CITY) {
      setMode(searchModes.city);
    } else if (name === USE_LOCATION) {
      setMode(searchModes.location);
    }
  }, [selectedCity, selectedState, selectedCountry, onSubmit, onClose]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!term) {
      notification.showIinfo('Please enter a service name!');
      return;
    }

    onSearch(term);
  }, [term, onSearch]);

  return (
    <div role="dialog" className="modal">
      <section className="modal-bold-body">
        {mode === searchModes.city ? (
          <>
            <label htmlFor={COUNTRY} className="bold-select-wrap">
              <span className="label">Select Country</span>
              <div className="bold-select">
                <select
                  name={COUNTRY}
                  value={(selectedCountry && selectedCountry.id) || ''}
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
                  value={(selectedState && selectedState.id) || ''}
                  onChange={handleValueChange}
                >
                  <option value="" disabled>-- Select State --</option>
                  {selectedCountry ? selectedCountry.states.map((state) => (
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
                  value={(selectedCity && selectedCity.id) || ''}
                  onChange={handleValueChange}
                >
                  <option value="" disabled>-- Select City --</option>
                  {selectedState ? selectedState.cities.map((city) => (
                    <option value={city.id} key={city.id}>{city.name}</option>
                  )) : null}
                </select>
              </div>
            </label>
            <button name={USE_CITY} type="button" className={css.city_select_submit_btn} onClick={handleClick}>
              Search In Selected City
            </button>
            <button type="button" name={USE_LOCATION} className={`link ${css.city_link}`} onClick={handleClick}>
              Use my device current location instead.
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className={css.city_select_form}>
            <p className={css.city_select_location_intro}>
              <span>Enter a service below to search using your device location.</span>
              <span>
                Please allow location access if prompted, to enable us query your location.
              </span>
            </p>
            <input
              type="search"
              placeholder="Enter Service Name"
              name={TERM}
              value={term}
              className={css.city_select_input}
              onChange={handleValueChange}
            />
            <button type="submit" className={css.city_select_submit_btn}>Search For Service</button>
            <button
              type="button"
              name={SELECT_CITY}
              className={`link ${css.city_link}`}
              onClick={handleClick}
            >
              Select a city instead.
            </button>
          </form>
        )}
        <SvgButton
          type="button"
          title="Close"
          color={colors.delete}
          path={paths.close}
          onClick={onClose}
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        />
      </section>
    </div>
  );
};

CitySelect.propTypes = {
  city: cityProps,
  state: stateProps,
  country: countryProps,
  countries: PropTypes.arrayOf(countryProps),
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

CitySelect.defaultProps = {
  city: null,
  state: null,
  country: null,
  countries: null,
};

const CitySearchPanelEx = ({
  setSearchCity,
  onSearch,
  onScan,
}) => {
  const countries = useSelector(selectCountries);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState();
  const initialized = useRef(false);
  const dialog = useDialog();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useUserLocation();

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

  useEffect(() => {
    setSearchCity(city);
  }, [city]);

  const handleSearch = useCallback((term) => {
    onSearch(term);
  }, [onSearch]);

  const handleLocationChange = useCallback((city, state, country) => {
    setCity(city);
    setState(state);
    setCountry(country);
  }, []);

  const searchByLocation = useCallback((term) => {
    navigate(`${routes.search}?term=${term}&force_current_location=true`);
  }, [navigate]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CHANGE_LOCATION) {
      let popup;
      const handleClose = () => popup.close();
      const search = (term) => {
        popup.close();
        searchByLocation(term);
      };

      popup = dialog.show(
        <CitySelect
          city={city}
          state={state}
          country={country}
          countries={countries}
          onClose={handleClose}
          onSubmit={handleLocationChange}
          onSearch={search}
        />,
      );
    }
  }, [countries, city, state, country, handleLocationChange, searchByLocation, dialog]);

  return (
    <section className={css.city_search_pane}>
      <p className={css.search_intro_text}>
        Discover top-notch service providers near you.
        Enter service below to start your search and get connected with the best
        professionals in your community.
      </p>
      <SearchForm onSearch={handleSearch} onScan={onScan} />
      <button type="button" name={CHANGE_LOCATION} className={css.city_prompt} onClick={handleClick}>
        {city ? (
          <>
            <span>{`You are currently searching in ${city.name}, ${state.name}, ${country.name}.`}</span>
            <span>Not your city? Click to change location.</span>
          </>
        ) : <span>Please click to select your city</span>}
      </button>
    </section>
  );
};

CitySearchPanelEx.propTypes = {
  setSearchCity: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onScan: PropTypes.func.isRequired,
};

const LocationSearchPanel = ({ onSearch, onToggle, onScan }) => {
  const handleSearch = useCallback((term) => {
    navigator.geolocation.getCurrentPosition(() => {
      // console.log(pos);
    }, () => {
      // console.log(err);
    }, { enableHighAccuracy: true });

    if (!testing) {
      onSearch(term);
    }
  }, []);

  return (
    <div>
      <p className={css.search_intro_text}>
        Discover top-notch service providers near you.
        Enter service below to start your search and get connected with the best
        professionals in your community.
      </p>
      <button
        type="button"
        className={`link compact-link ${css.search_mode_toggle_btn}`}
        onClick={onToggle}
      >
        Searching by location. Click to search by city instead.
      </button>
      <SearchForm onSearch={handleSearch} onScan={onScan} />
    </div>
  );
};

LocationSearchPanel.propTypes = {
  onScan: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
};

const CodeReader = () => {
  const videoRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new QrScanner(videoRef.current, (result) => {
      const code = result.data;
      if (code) {
        scanner.stop();
        navigate(routes.providerPage(code));
      }
    }, { returnDetailedScanResult: true });
    scanner.start();
    return () => scanner.stop();
  }, []);

  return (
    <video ref={videoRef} className={css.video} />
  );
};

export const SearchPanelOld = () => {
  const [locationMode, setLocationMode] = useState(true);
  const [city, setCity] = useState(null);
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  const toggleSearchMode = useCallback(() => setLocationMode((mode) => !mode), []);

  const handleSearch = useCallback((term) => {
    if (term) {
      let path = `${routes.search}?term=${term}`;
      if (locationMode) {
        path += '&force_current_location=true';
      } else if (city) {
        path += `&city_id=${city.id}`;
      } else {
        notification.showError('Please selet a city!');
        return;
      }

      navigate(path);
    }
  }, [locationMode, city]);

  const handleCommonTermClick = useCallback(({ target: { name } }) => handleSearch(name), []);

  const handleScan = useCallback(() => {
    setScanning(true);
  }, []);

  const cancelScan = useCallback(() => setScanning(false), []);

  return (
    <div className={css.search_wrap}>
      {scanning ? (
        <div className={css.video_wrap}>
          <CodeReader />
          <div className={css.video_controls}>
            <button type="button" className="control-btn cancel" onClick={cancelScan}>
              Cancel Scan
            </button>
          </div>
        </div>
      ) : (
        <>
          {locationMode ? (
            <LocationSearchPanel
              onScan={handleScan}
              onSearch={handleSearch}
              onToggle={toggleSearchMode}
            />
          ) : (
            <CitySearchPanel
              setSearchCity={setCity}
              onSearch={handleSearch}
              onScan={handleScan}
              toggleSearchMode={toggleSearchMode}
            />
          )}
          <div className={css.common_search_term_btns_panel}>
            {commonTerms.map((term) => (
              <button
                key={term}
                type="button"
                name={term}
                className={css.common_search_term_btn}
                onClick={handleCommonTermClick}
              >
                {term}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const SearchPanel = () => {
  const [city, setCity] = useState(null);
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback((term) => {
    if (term) {
      let path = `${routes.search}?term=${term}`;
      if (city) {
        path += `&city_id=${city.id}`;
      } else {
        notification.showError('Please selet a city!');
        return;
      }

      navigate(path);
    }
  }, [city]);

  const handleCommonTermClick = useCallback(({ target: { name } }) => handleSearch(name), []);

  const handleScan = useCallback(() => {
    setScanning(true);
  }, []);

  const cancelScan = useCallback(() => setScanning(false), []);

  return (
    <div className={css.search_wrap}>
      {scanning ? (
        <div className={css.video_wrap}>
          <CodeReader />
          <div className={css.video_controls}>
            <button type="button" className="control-btn cancel" onClick={cancelScan}>
              Cancel Scan
            </button>
          </div>
        </div>
      ) : (
        <>
          <CitySearchPanel
            setSearchCity={setCity}
            onSearch={handleSearch}
            onScan={handleScan}
          />
          <div className={css.common_search_term_btns_panel}>
            {commonTerms.map((term) => (
              <button
                key={term}
                type="button"
                name={term}
                className={css.common_search_term_btn}
                onClick={handleCommonTermClick}
              >
                {term}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const SearchEx = () => {
  const [city, setCity] = useState(null);
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback((term) => {
    if (term) {
      let path = `${routes.search}?term=${term}`;
      if (city) {
        path += `&city_id=${city.id}`;
      } else {
        notification.showError('Please selet a city!');
        return;
      }

      navigate(path);
    }
  }, [city]);

  const handleCommonTermClick = useCallback(({ target: { name } }) => {
    handleSearch(name);
  }, [handleSearch]);

  const handleScan = useCallback(() => {
    setScanning(true);
  }, []);

  const cancelScan = useCallback(() => setScanning(false), []);

  return (
    <div className={css.search_wrap}>
      {scanning ? (
        <div className={css.video_wrap}>
          <CodeReader />
          <div className={css.video_controls}>
            <button type="button" className="control-btn cancel" onClick={cancelScan}>
              Cancel Scan
            </button>
          </div>
        </div>
      ) : (
        <>
          <CitySearchPanelEx
            setSearchCity={setCity}
            onSearch={handleSearch}
            onScan={handleScan}
          />
          <div className={css.common_search_term_btns_panel}>
            {commonTerms.map((term) => (
              <button
                key={term}
                type="button"
                name={term}
                className={css.common_search_term_btn}
                onClick={handleCommonTermClick}
              >
                {term}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const SearchRow = () => (
  <section className={`${homeCss.section_row} ${css.container}`}>
    <div className={css.left}>
      <span className={css.business_platform}>All Business, One Platform</span>
      <h1 className={css.heading}>
        <span className={css.heading_row_1}>Find Your Perfect</span>
        <span className="relative">Services Today</span>
      </h1>
      <SearchEx />
      <StarRatingsPanel />
    </div>
    <div className={css.right}>
      <Slider slides={slides} Slide={Slide} hideNav showBullets />
    </div>
  </section>
);

export default SearchRow;

/* eslint-enable jsx-a11y/media-has-caption */
