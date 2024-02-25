import { childrenProps } from '../utils/propTypes';

export const Heading = ({ children }) => (
  <h1 className="font-bold text-base leading-[22.4px] tracking-[-2%]">
    {children}
  </h1>
);

Heading.propTypes = {
  children: childrenProps,
};

Heading.defaultProps = {
  children: null,
};

const Aside = ({ children }) => (
  <aside className="w-[278px] bg-white h-full ps-5 py-10 overflow-auto border-r">
    {children}
  </aside>
);

Aside.propTypes = {
  children: childrenProps,
};

Aside.defaultProps = {
  children: null,
};

export default Aside;
