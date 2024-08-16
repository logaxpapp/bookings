import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import css from './style.module.css';

const after = (time, callback) => {
  let start = 0;
  let cleared = false;

  const clear = () => {
    cleared = true;
  };

  const frame = (t) => {
    if (cleared) {
      return;
    }
    if (!start) {
      start = t - (1 / 60);
    } else {
      const ellapsed = t - start;
      if (ellapsed >= time) {
        callback(ellapsed);
        return;
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  return {
    clear,
  };
};

const every = (time, callback) => {
  let start = 0;
  let cleared = false;

  const clear = () => {
    cleared = true;
  };

  const frame = (t) => {
    if (cleared) {
      return;
    }
    if (!start) {
      start = t - (1 / 60);
    } else {
      const ellapsed = t - start;
      if (ellapsed >= time) {
        callback(ellapsed);
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  return {
    clear,
  };
};

const Timer = {
  after,
  every,
};

const getSlideCountDown = () => {
  let active = false;

  return {
    reset: () => {
      active = true;
      Timer.after(700, () => {
        active = false;
      });
    },
    isActive: () => active,
  };
};

const Slider = ({
  slides,
  Slide,
  hideNav,
  showBullets,
}) => {
  const [bullets, setBullets] = useState([]);
  const lastIndex = useRef(slides.length - 1);
  const timer = useRef(null);
  const SlideCountDown = useRef(getSlideCountDown());

  useEffect(() => {
    setBullets(
      slides ? slides.map((s, idx) => idx) : [],
    );
  }, [slides, setBullets]);

  const nextIndex = (idx) => {
    let nIdx = idx + 1;
    if (nIdx > lastIndex.current) {
      nIdx = 0;
    }
    return nIdx;
  };

  const previousIndex = (idx) => {
    let pIdx = idx - 1;
    if (pIdx < 0) {
      pIdx = lastIndex.current;
    }
    return pIdx;
  };

  const [state, setState] = useState({
    idx: 0,
    isLeft: true,
    slide: false,
    centered: true,
    left: {
      index: previousIndex(0),
      class: css.left,
    },
    center: {
      index: 0,
      class: css.foremost,
    },
    right: {
      index: nextIndex(0),
      class: css.right,
    },
  });

  const executeSlide = (isLeft) => {
    const { idx, isLeft: prevLeft, centered } = state;
    let leftClass;
    let centerClass;
    let rightClass;
    let currentlyCentered;

    if (centered) {
      if (isLeft) {
        leftClass = css.left;
        centerClass = css.left;
        rightClass = '';
      } else {
        rightClass = css.right;
        centerClass = css.right;
        leftClass = '';
      }
      currentlyCentered = false;
    } else if (prevLeft === isLeft) {
      if (isLeft) {
        leftClass = css.left;
        rightClass = css.left;
        centerClass = '';
      } else {
        leftClass = css.right;
        rightClass = css.right;
        centerClass = '';
      }
      currentlyCentered = true;
    } else {
      if (isLeft) {
        leftClass = css.left;
        rightClass = '';
        centerClass = css.left;
      } else {
        leftClass = '';
        rightClass = css.right;
        centerClass = css.right;
      }
      currentlyCentered = false;
    }

    setState({
      idx: isLeft ? nextIndex(idx) : previousIndex(idx),
      slide: true,
      isLeft,
      centered: currentlyCentered,
      left: { ...state.left, class: leftClass },
      center: { ...state.center, class: centerClass },
      right: { ...state.right, class: rightClass },
    });
  };

  const reArrange = () => {
    const { idx, isLeft, centered } = state;
    let left;
    let right;
    let center;
    if (centered) {
      center = { index: idx, class: css.foremost };
      left = { index: previousIndex(idx), class: css.left };
      right = { index: nextIndex(idx), class: css.right };
    } else if (isLeft) {
      right = { index: idx, class: css.foremost };
      center = { index: nextIndex(idx), class: css.right };
      left = { index: previousIndex(idx), class: css.left };
    } else {
      left = { index: idx, class: css.foremost };
      center = { index: previousIndex(idx), class: css.left };
      right = { index: nextIndex(idx), class: css.right };
    }
    setState({
      idx,
      isLeft,
      slide: false,
      centered,
      left,
      center,
      right,
    });
  };

  const slide = (isLeft) => {
    if (SlideCountDown.current.isActive()) {
      return;
    }
    SlideCountDown.current.reset();
    if (timer.current) {
      timer.current.clear();
    }
    executeSlide(isLeft);
  };

  const next = () => {
    slide(true);
  };

  const previous = () => {
    slide(false);
  };

  useEffect(() => {
    if (state.slide) {
      Timer.after(400, () => {
        reArrange();
      });
    } else {
      timer.current = Timer.after(5000, next);
    }
  }, [state]);

  if (slides.length <= 0) {
    return (
      <div className={css.noContent}>
        <h2>No Slides Available</h2>
      </div>
    );
  }

  return (
    <div className={css.container}>
      <div className={css.slides_wrap}>
        <div className={`${css.slide} ${state.left.class}`}>
          <Slide slide={slides[state.left.index]} />
        </div>
        <div className={`${css.slide} ${state.center.class}`}>
          <Slide slide={slides[state.center.index]} />
        </div>
        <div className={`${css.slide} ${state.right.class}`}>
          <Slide slide={slides[state.right.index]} />
        </div>
        {hideNav ? null : (
          <div className={css.cover}>
            <nav className={css.nav}>
              <button aria-label="next" type="button" className={css.navBtn} onClick={next}>
                <svg viewBox="0 0 7.4099998 12">
                  <path
                    fill="currentColor"
                    d="M 7.41,10.58 2.83,6 7.41,1.41 6,0 0,6 6,12 Z"
                  />
                </svg>
              </button>
              <button aria-label="previous" type="button" className={css.navBtn} onClick={previous}>
                <svg viewBox="0 0 7.4099998 12">
                  <path
                    fill="currentColor"
                    d="M 0,10.58 4.58,6 0,1.41 1.41,0 l 6,6 -6,6 z"
                  />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
      {showBullets ? (
        <div className={css.bullets_panel}>
          {bullets.map((i) => (
            <span
              key={i}
              className={`${css.bullet} ${state.idx === i ? css.current : ''}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

Slider.propTypes = {
  slides: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  Slide: PropTypes.elementType.isRequired,
  hideNav: PropTypes.bool,
  showBullets: PropTypes.bool,
};

Slider.defaultProps = {
  hideNav: false,
  showBullets: false,
};

export default Slider;
