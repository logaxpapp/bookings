import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { useWindowSize } from '../lib/hooks';
import { childrenProps } from '../utils/propTypes';

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    pointerEvents: 'none',
  },
};

const Popup = ({
  role,
  x,
  y,
  children,
}) => {
  const container = useRef(null);

  const [style, setStyle] = useState({
    left: x,
    top: y,
  });

  const windowSize = useWindowSize();

  useEffect(() => {
    const newStyle = {};

    /** @type {DOMRect} */
    const rect = container.current.getBoundingClientRect();
    const left = style.left ? rect.left : rect.right;
    const top = style.top ? rect.top : rect.bottom;

    if (left + rect.width <= windowSize.width) {
      newStyle.left = x;
    } else if (left <= rect.width) {
      newStyle.right = windowSize.width - x;
    } else {
      newStyle.left = 5;
      newStyle.maxWidth = rect.width - 10;
    }

    if (top + rect.height <= windowSize.height) {
      newStyle.top = y;
    } else if (top >= rect.height) {
      newStyle.bottom = windowSize.height - top;
    } else {
      let t = windowSize.height - rect.height;
      if (t < 0) {
        t = 5;
        newStyle.maxHeight = windowSize - 10;
      }
      newStyle.top = t;
    }

    setStyle(newStyle);
  }, [x, y, windowSize, setStyle]);

  return (
    <section
      role={role}
      ref={container}
      style={{
        ...style,
        position: 'absolute',
      }}
    >
      {children}
    </section>
  );
};

Popup.propTypes = {
  role: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.instanceOf(Element),
    PropTypes.elementType,
  ]),
};

Popup.defaultProps = {
  role: 'menu',
  x: 0,
  y: 0,
  children: null,
};

const manager = (() => {
  let callback = null;

  return {
    subscribe: (cb) => {
      callback = cb;
    },
    unsubscribe: () => {
      callback = null;
    },
    clear: () => {
      if (callback) callback(null);
    },
    show: (element) => {
      if (callback) callback(element);
    },
  };
})();

const ContextMenu = ({ zIndex }) => {
  const [element, setElement] = useState(null);
  const style = useMemo(() => ({ ...styles.container, zIndex }), []);

  useEffect(() => {
    manager.subscribe((element) => setElement(element));
    return () => manager.unsubscribe();
  }, []);

  if (!element) return null;

  return (
    <div style={style}>
      {element}
    </div>
  );
};

ContextMenu.propTypes = {
  zIndex: PropTypes.number,
};

ContextMenu.defaultProps = {
  zIndex: 10002,
};

const HoverDialog = ({
  x,
  y,
  left,
  top,
  width,
  height,
  onClose,
  children,
}) => {
  const [menuStyle, setMenuStyle] = useState({
    position: 'absolute',
    left: x - left,
    top: y - top,
  });
  const wrapper = useRef();
  const menu = useRef();
  const screenSize = useWindowSize();

  useEffect(() => {
    wrapper.current.addEventListener('mouseleave', onClose);
  }, []);

  useEffect(() => {
    /** @type {DOMRect} */
    const parentRect = wrapper.current.getBoundingClientRect();
    /** @type {DOMRect} */
    const {
      // left,
      // top,
      width,
      height,
    } = menu.current.getBoundingClientRect();

    const style = { position: 'absolute' };

    if (parentRect.left + width <= screenSize.width) {
      style.left = 0;
    } else if (parentRect.left >= width) {
      style.right = parentRect.width;
    } else {
      style.right = parentRect.right - screenSize.width + 10;
      style.maxWidth = screenSize.width - 20;
    }

    if (parentRect.top + height <= screenSize.height) {
      style.top = 0;
    } else if (parentRect.top >= height) {
      style.bottom = parentRect.height;
    } else {
      style.bottom = 10 + parentRect.bottom - screenSize.height;
      style.height = screenSize.height - 20;
    }

    setMenuStyle(style);
  }, [screenSize, setMenuStyle]);

  return (
    <div
      ref={wrapper}
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        pointerEvents: 'all',
      }}
    >
      <div ref={menu} style={menuStyle}>
        {children}
      </div>
    </div>
  );
};

HoverDialog.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  children: childrenProps.isRequired,
};

export const useOnHoverContextMenu = () => ({
  Menu: ({
    refElement,
    children,
  }) => {
    const handleMouseEnter = useCallback(() => {
      /** @type {DOMRect} */
      const rect = refElement.current.getBoundingClientRect();

      manager.show(
        <HoverDialog
          x={rect.left - 20}
          y={rect.bottom - 20}
          left={rect.left}
          top={rect.top}
          width={rect.width}
          height={rect.height}
          onClose={manager.clear}
        >
          {children}
        </HoverDialog>,
      );
    }, []);

    useEffect(() => {
      refElement.current.addEventListener('mouseenter', handleMouseEnter);
    }, []);

    return null;
  },
});

const Dialog = ({
  x,
  y,
  left,
  top,
  width,
  height,
  children,
}) => {
  const [menuStyle, setMenuStyle] = useState({
    position: 'absolute',
    left: x - left,
    top: y - top,
  });
  const wrapper = useRef();
  const menu = useRef();
  const screenSize = useWindowSize();

  useEffect(() => {
    /** @type {DOMRect} */
    const parentRect = wrapper.current.getBoundingClientRect();
    /** @type {DOMRect} */
    const {
      left,
      top,
      width,
      height,
    } = menu.current.getBoundingClientRect();

    const style = { position: 'absolute' };

    if (left + width <= screenSize.width) {
      style.left = left - parentRect.left;
    } else if (left <= width) {
      style.right = parentRect.right - left;
    } else {
      style.right = parentRect.right - screenSize.width + 10;
      style.maxWidth = screenSize.width - 20;
    }

    if (top + height <= screenSize.height) {
      style.top = top - parentRect.top;
    } else if (top <= height) {
      style.bottom = parentRect.bottom - top;
    } else {
      style.bottom = parentRect.bottom - screenSize.height + 10;
      style.maxHeight = screenSize.height - 20;
    }

    setMenuStyle(style);
  }, [screenSize, setMenuStyle]);

  return (
    <div
      ref={wrapper}
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        pointerEvents: 'all',
      }}
    >
      <div ref={menu} style={menuStyle}>
        {children}
      </div>
    </div>
  );
};

Dialog.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  children: childrenProps.isRequired,
};

export const useContextMenu = () => ({
  Menu: ({
    isOpen,
    refElement,
    onClose,
    children,
  }) => {
    const open = useRef(false);

    const closeMenu = useCallback(() => {
      manager.clear();
      document.removeEventListener('mousedown', closeMenu);
      onClose();
    }, []);

    useEffect(() => {
      if (isOpen) {
        if (!open.current) {
          /** @type {DOMRect} */
          const rect = refElement.current.getBoundingClientRect();

          manager.show(
            <Dialog
              x={rect.left - 20}
              y={rect.bottom - 20}
              left={rect.left}
              top={rect.top}
              width={rect.width}
              height={rect.height}
              onClose={manager.clear}
            >
              {children}
            </Dialog>,
          );

          document.addEventListener('mousedown', closeMenu);
        }
      } else if (open.current) {
        manager.clear();
        open.current = false;
      }
    }, [isOpen]);

    return null;
  },
});

export default ContextMenu;
