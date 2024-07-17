import PropTypes from 'prop-types';
import { childrenProps } from '../utils/propTypes';

export const Heading = ({ children }) => (
  <h1 className="font-bold text-base leading-[22.4px] -tracking-[2%] m-0">
    {children}
  </h1>
);

Heading.propTypes = {
  children: childrenProps,
};

Heading.defaultProps = {
  children: null,
};

export const Heading1 = ({ children }) => (
  <h1 className="font-bold text-xl text-[#011c39] dark:text-white -tracking-[3%] m-0">
    {children}
  </h1>
);

Heading1.propTypes = {
  children: childrenProps,
};

Heading1.defaultProps = {
  children: null,
};

export const Heading2 = ({ children }) => (
  <h1 className="font-semibold text-lg text-[#5c5c5c] dark:text-white m-0">
    {children}
  </h1>
);

Heading2.propTypes = {
  children: childrenProps,
};

Heading2.defaultProps = {
  children: null,
};

const Aside = ({ isSidebarOpen, children }) => (
  <aside
    className={`w-[278px] bg-white h-full ps-5 py-10 overflow-auto border-r border-slate-200 absolute sm:relative z-9 ease-linear duration-300 ${isSidebarOpen ? '-translate-x-full sm:-translate-x-0' : '-translate-x-0'}`}
  >
    {children}
  </aside>
);

Aside.propTypes = {
  children: childrenProps,
  isSidebarOpen: PropTypes.bool,
};

Aside.defaultProps = {
  children: null,
  isSidebarOpen: true,
};

export default Aside;
