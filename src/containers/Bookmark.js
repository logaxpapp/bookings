import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  deleteBookmarkedCompany,
  bookmarkCompany,
  selectBookmarkedCompanies,
} from '../redux/userPreferences';
import { paths } from '../components/svg';

const styles = {
  btn: {
    cursor: 'pointer',
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
};

/**
 * @param {Object} props
 * @param {Object} props.company
 * @param {number} props.company.id
 * @param {string} props.company.name
 * @param {string | { id: number, url: string }} props.company.profilePicture
 * @param {string} props.className
 * @param {number} props.size
 * @param {import('../types').NamedStyle} props.style
 * @returns
 */
const Bookmark = ({
  company,
  className,
  size,
  style,
}) => {
  const bookmarkedCompanies = useSelector(selectBookmarkedCompanies);
  const [bookmarked, setBookmarked] = useState(false);
  const [btnStyle, setBtnStyle] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    setBookmarked(!!bookmarkedCompanies.find(({ id }) => id === company.id));
  }, [company, bookmarkedCompanies, setBookmarked]);

  useEffect(() => {
    setBtnStyle({ ...styles.btn, ...style });
  }, [style]);

  const handleClick = useCallback(() => {
    if (bookmarked) {
      dispatch(deleteBookmarkedCompany(company.id));
    } else {
      dispatch(bookmarkCompany({
        id: company.id,
        name: company.name,
        url: typeof company.profilePicture === 'string'
          ? company.profilePicture
          : company.profilePicture.url,
      }));
    }
  }, [bookmarked]);

  return (
    <button
      type="button"
      className={className}
      style={btnStyle}
      onClick={handleClick}
    >
      <svg
        viewBox="0 0 24 24"
        style={{
          pointerEvents: 'none',
          width: size,
          height: size,
        }}
      >
        <path fill={bookmarked ? '#dbbe77' : '#b1aea5'} d={paths.bookmark} />
      </svg>
      <span style={{ pointerEvents: 'none' }}>
        {bookmarked ? 'Bookmarked' : 'Bookmark'}
      </span>
    </button>
  );
};

Bookmark.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.shape({}),
  company: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    profilePicture: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        id: PropTypes.number,
        url: PropTypes.string,
      }),
    ]),
  }).isRequired,
};

Bookmark.defaultProps = {
  className: null,
  size: 24,
  style: {},
};

export default Bookmark;
