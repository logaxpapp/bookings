import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import css from './style.module.css';
import homeCss from '../style.module.css';
import { loadCountriesAsync, selectCountries } from '../../../redux/countriesSlice';
import Slider from '../../../lib/Slider';
import slide1 from '../../../assets/images/hair-spies-1.jpg';
import slide2 from '../../../assets/images/manicure.jpg';
import slide3 from '../../../assets/images/hair-spies-2.jpg';
import StarRating from '../../../lib/StarRating';
import routes from '../../../routing/routes';
import { useNotification } from '../../../lib/Notification';

const CITY = 'city';
const COUNTRY = 'country';
const STATE = 'state';
const TERM = 'term';

const commonTerms = [
  'Hairstylist', 'Barber', 'Car Washer', 'House Cleaner',
];

const slides = [
  { id: 1, alt: 'haircut', src: slide1 },
  { id: 2, alt: 'manicure', src: slide2 },
  { id: 3, alt: 'haircut', src: slide3 },
];

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

const SearchForm = ({ onSearch }) => {
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
    </form>
  );
};

SearchForm.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

const CitySearchPanel = ({ setSearchCity, onSearch, toggleSearchMode }) => {
  const countries = useSelector(selectCountries);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!countries) {
      dispatch(loadCountriesAsync(() => {}));
    }
  }, []);

  useEffect(() => {
    if (countries) {
      setCountry(countries[0]);
    }
  }, [countries, setCountry]);

  useEffect(() => setState(country ? country.states[0] : null), [country, setState]);

  useEffect(() => setCity(state ? state.cities[0] : null), [state, setCity]);

  useEffect(() => setSearchCity(city), [city]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === COUNTRY) {
      setCountry(countries.find((c) => c.id === Number.parseInt(value, 10)));
    } else if (name === STATE) {
      setState((country && country.states.find(
        (s) => s.id === Number.parseInt(value, 10),
      )) || null);
    } else if (name === CITY) {
      setCity((state && state.cities.find((c) => c.id === Number.parseInt(value, 10))) || null);
    }
  }, [countries, country, state, setCountry, setState, setCity]);

  const handleSearch = useCallback((term) => {
    if (city) {
      onSearch(term);
    }
  }, [city]);

  return (
    <section className={css.city_search_panel}>
      <button
        type="button"
        className={`link compact-link ${css.search_mode_toggle_btn}`}
        onClick={toggleSearchMode}
      >
        Search By My Location
      </button>
      <SearchForm onSearch={handleSearch} />
      <div className={css.city_search_selects_wrap}>
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
        </div>
      </div>
    </section>
  );
};

CitySearchPanel.propTypes = {
  setSearchCity: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  toggleSearchMode: PropTypes.func.isRequired,
};

const SearchPanel = () => {
  const [locationMode, setLocationMode] = useState(true);
  const [city, setCity] = useState(null);
  const notification = useNotification();
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

  return (
    <div className={css.search_wrap}>
      {locationMode ? (
        <div>
          <p className={css.search_intro_text}>
            Discover top-notch service providers near you.
            Enter service below to start your search and get connected with the best
            professionals in your community.
          </p>
          <button
            type="button"
            className={`link compact-link ${css.search_mode_toggle_btn}`}
            onClick={toggleSearchMode}
          >
            Searching by location. Click to search by city instead.
          </button>
          <SearchForm onSearch={handleSearch} />
        </div>
      ) : (
        <CitySearchPanel
          setSearchCity={setCity}
          onSearch={handleSearch}
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
      <SearchPanel />
      <StarRatingsPanel />
    </div>
    <div className={css.right}>
      <Slider slides={slides} Slide={Slide} hideNav showBullets />
    </div>
  </section>
);

export default SearchRow;
