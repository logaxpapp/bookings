import {
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { childrenProps } from '../utils/propTypes';
import { useWindowSize } from '../lib/hooks';

const GridPanel = ({ children, minimumChildWidth, maxColumns }) => {
  const [state, setState] = useState({
    columns: 1,
    style: {
      display: 'grid',
      width: '100%',
      flex: 1,
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
    },
  });
  const { width } = useWindowSize();
  const panel = useRef(null);

  useEffect(() => {
    let columns = Math.floor(panel.current.clientWidth / minimumChildWidth);
    if (maxColumns && columns > maxColumns) {
      columns = maxColumns;
    }
    setState((state) => (
      state.columns === columns ? state : {
        columns,
        style: {
          ...state.style,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        },
      }
    ));
  }, [width, minimumChildWidth, setState]);

  return (
    <section ref={panel} style={state.style}>
      {children}
    </section>
  );
};

GridPanel.propTypes = {
  minimumChildWidth: PropTypes.number.isRequired,
  maxColumns: PropTypes.number,
  children: childrenProps,
};

GridPanel.defaultProps = {
  maxColumns: 0,
  children: null,
};

export default GridPanel;
