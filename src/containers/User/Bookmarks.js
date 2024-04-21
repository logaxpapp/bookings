import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { CheckIcon, InformationCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { deleteBookmarkedCompany, selectBookmarkedCompanies } from '../../redux/userPreferences';
import routes from '../../routing/routes';
import UserSearchbarContainer from './UserSearchbarContainer';
import defaultImages from '../../utils/defaultImages';

const companyProps = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
});

const CompanyRow = ({ company, onToggleSelected, selections }) => {
  const checked = useMemo(() => (
    selections.find((id) => id === company.id)
  ), [company, selections]);

  const { page, src } = useMemo(() => ({
    page: routes.user.dashboard.absolute.providers(company.id),
    src: company.url || defaultImages.profile,
  }));

  return (
    <section className="w-full flex items-end text-[#011c39] dark:text-white gap-6 px-1">
      <header className="flex items-center gap-4">
        <button
          type="button"
          aria-label="toggle selected"
          onClick={() => onToggleSelected(company.id, !checked)}
          className="w-6 h-6 rounded-sm bg-transparent border border-[#d0d2d5] dark:border-[#ddd] flex items-center justify-center"
        >
          {checked ? (
            <CheckIcon className="w-4 h-4 text-[#89e101]" />
          ) : null}
        </button>
        <img
          alt="!"
          src={src}
          className="w-10 h-10 rounded ml-3"
        />
        <div className="flex flex-col gap-2">
          <h1 className="font-normal m-0 text-base">
            {company.name}
          </h1>
          <Link
            to={page}
            className="text-blue-600 flex-1 text-ellipsis whitespace-nowrap"
            title={`${window.location.protocol}://${window.location.host}${page}`}
          >
            {`${window.location.protocol}://${window.location.host}${page}`}
          </Link>
        </div>
      </header>
      <div className="flex-1 flex">
        <span title={company.address}>
          {company.address}
        </span>
      </div>
    </section>
  );
};

CompanyRow.propTypes = {
  company: companyProps.isRequired,
  onToggleSelected: PropTypes.func.isRequired,
  selections: PropTypes.arrayOf(PropTypes.number).isRequired,
};

const UserBookmarks = () => {
  const companies = useSelector(selectBookmarkedCompanies);
  const dispatch = useDispatch();
  const [selections, setSelections] = useState([]);

  const handleDelete = () => {
    if (selections) {
      dispatch(deleteBookmarkedCompany(selections));
    }
  };

  const handleSelectAll = () => {
    if (selections.length) {
      setSelections([]);
    } else {
      setSelections(companies.map(({ id }) => id));
    }
  };

  const handleChecked = (id, checked) => {
    if (checked) {
      setSelections((selections) => [...selections, id]);
    } else {
      setSelections((selections) => selections.filter((sel) => sel !== id));
    }
  };

  return (
    <UserSearchbarContainer>
      <section className="fllex flex-col overflow-hidden p-6">
        <header
          className="mb-6 mx-1 py-3 text-center text-sm flex items-center justify-between border-b border-slate-200 dark:border-slate-600"
        >
          <div className="flex items-center gap-6">
            <button
              type="button"
              aria-label="toggle check all"
              disabled={!companies.length}
              onClick={handleSelectAll}
              className="w-6 h-6 p-0 rounded-sm bg-transparent border border-[#d0d2d5] dark:border-slate-200 flex items-center justify-center"
            >
              {selections.length && selections.length === companies.length ? (
                <CheckIcon className="w-4 h-4 text-[#89e101]" />
              ) : null}
            </button>
            {selections.length ? (
              <button
                type="button"
                aria-label="delete selected"
                onClick={handleDelete}
                className="bg-transparent p-0"
              >
                <TrashIcon className="h-6 w-6 text-[#5c5c5c] dark:text-white" />
              </button>
            ) : (
              <button
                aria-hidden="true"
                type="button"
                onClick={handleSelectAll}
                className="bg-transparent p-0 text-base"
              >
                Select All
              </button>
            )}
          </div>
          <InformationCircleIcon
            aria-label="Bookmarked companies are saved to your device."
            className="w-6 h-6 text-[#5c5c5c] dark:text-white"
            title="Bookmarked companies are saved to your device."
          />
        </header>
        {companies.length ? (
          <ul className="list overflow-auto gap-6">
            {companies.map((company) => (
              <li key={company.id}>
                <CompanyRow
                  company={company}
                  selections={selections}
                  onToggleSelected={handleChecked}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="font-bold text-xl text-[#858b9c] dark:text-[#ccc] pt-8 flex flex-col items-center gap-4">
            You have NOT bookmarked any Companies!
          </div>
        )}
      </section>
    </UserSearchbarContainer>
  );
};

export default UserBookmarks;
