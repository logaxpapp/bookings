import PropTypes from 'prop-types';
import { childrenProps } from '../utils/propTypes';

export const TabHeader = ({ header, tab, setTab }) => {
  const isActive = tab === header;

  const handleClick = () => {
    if (!isActive) {
      setTab(header);
    }
  };

  return (
    <button
      aria-current={isActive}
      type="button"
      onClick={handleClick}
      className={`py-0 border-none outline-none bg-transparent cursor-pointer font-medium ${isActive ? 'underline font-bold text-[#011c39]' : 'text-[#8e98ab]'}`}
    >
      {header}
    </button>
  );
};

TabHeader.propTypes = {
  header: PropTypes.string.isRequired,
  tab: PropTypes.string.isRequired,
  setTab: PropTypes.func.isRequired,
};

export const TabBody = ({
  tab,
  header,
  children,
  className,
}) => {
  const isActive = tab === header;

  return (
    <div
      role="tab"
      aria-current={isActive}
      aria-hidden={!isActive}
      className={`${className} ${isActive ? 'block' : 'hidden'}`}
    >
      {children}
    </div>
  );
};

TabBody.propTypes = {
  tab: PropTypes.string.isRequired,
  header: PropTypes.string.isRequired,
  children: childrenProps,
  className: PropTypes.string,
};

TabBody.defaultProps = {
  children: null,
  className: '',
};

export const TabHeaders = ({ headers, tab, setTab }) => (
  <div className="flex items-center gap-6">
    {headers.map((header) => <TabHeader key={header} header={header} tab={tab} setTab={setTab} />)}
  </div>
);

TabHeaders.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.string),
  tab: PropTypes.string,
  setTab: PropTypes.func.isRequired,
};

TabHeaders.defaultProps = {
  headers: [],
  tab: '',
};
