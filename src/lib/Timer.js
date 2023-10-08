/**
 * @typedef {Object} Handler
 * @property {Function} cancel
 */

/**
 * Altermative to setTimeout and setInterval.
 * Uses requestAnimationFrame for performance.
 * CAUTION: Every call adds a callback to requestAnimation Frame.
 * Too many and performance will be affected - optimization NOt tested yet.
 */
const Timer = {
  /**
   * Invokes @callback funcion after @time milliseconds
   * @param {number} time Time in milliseconds to invoke @callback
   * @param {*} callback function to invoke after @time milliseconds
   * @returns {Handler} cancel handler
   */
  after: (time, callback) => {
    const interval = time;
    const capturedCallback = callback;
    let cancelled = false;
    let start;

    const loop = (timestamp) => {
      if (cancelled) return;
      if (!start) {
        start = timestamp;
        requestAnimationFrame(loop);
        return;
      }

      const ellapsed = timestamp - start;

      if (ellapsed >= interval) {
        capturedCallback(ellapsed);
        return;
      }
      requestAnimationFrame(loop);
    };

    loop();

    return {
      cancel: () => {
        cancelled = true;
      },
    };
  },
  every: (time, callback) => {
    let cancelled = false;
    let threshold;

    const loop = (timestamp) => {
      if (cancelled) {
        return;
      }

      if (!threshold) {
        threshold = timestamp + time;
        requestAnimationFrame(loop);
        return;
      }

      if (timestamp >= threshold) {
        threshold = timestamp + time;
        callback();
      }

      requestAnimationFrame(loop);
    };

    loop();

    return {
      cancel: () => {
        cancelled = true;
      },
    };
  },
};

// const loop = (interval) => {
//   console.log(interval);
//   Timer.after(1000, loop);
// };

// loop();

export default Timer;
