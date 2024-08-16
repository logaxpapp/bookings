import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { BookmarkSquareIcon } from '@heroicons/react/24/outline';
import {
  deleteBookmarkedCompany,
  bookmarkCompany,
  selectBookmarkedCompanies,
} from '../redux/userPreferences';
import { addressText } from '../utils';

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
const BookmarkButton = ({ company }) => {
  const bookmarkedCompanies = useSelector(selectBookmarkedCompanies);
  const bookmarked = useMemo(() => (
    !!bookmarkedCompanies.find(({ id }) => id === company.id)
  ), [company, bookmarkedCompanies]);
  const dispatch = useDispatch();

  const handleClick = () => {
    if (bookmarked) {
      dispatch(deleteBookmarkedCompany(company.id));
    } else {
      dispatch(bookmarkCompany({
        id: company.id,
        name: company.name,
        address: company.address ? addressText(company.address) : '',
        url: typeof company.profilePicture === 'string'
          ? company.profilePicture
          : company.profilePicture?.url || '',
      }));
    }
  };

  return (
    <button
      type="button"
      aria-label="bookmark"
      title="Bookmark"
      className="outline-none border-none p-1 bg-transparent cursor-pointer"
      onClick={handleClick}
    >
      <BookmarkSquareIcon
        className={`w-4.5 h-4.5 ${bookmarked ? 'text-[#89e101]' : 'text-[#5c5c5c] dark:text-white'}`}
      />
    </button>
  );
};

BookmarkButton.propTypes = {
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
    address: PropTypes.shape({}),
  }).isRequired,
};

export default BookmarkButton;
