import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { childrenProps } from '../utils/propTypes';
import { useWindowSize } from '../lib/hooks';

const PageHeader = ({ title, children }) => {
  const [fontSize, setFontSize] = useState('1.3rem');
  const header = useRef(null);
  const { width } = useWindowSize();

  useEffect(() => {
    const pWidth = header.current.clientWidth;
    if (pWidth < 400) {
      setFontSize('1rem');
    } else {
      setFontSize('1.3rem');
    }
  }, [width, setFontSize]);

  return (
    <header ref={header} className="page-header">
      <h1 style={{ fontSize, marginBottom: 0 }}>
        {title}
      </h1>
      {children}
    </header>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  children: childrenProps,
};

PageHeader.defaultProps = {
  children: null,
};

export default PageHeader;
