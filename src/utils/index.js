/* eslint-disable import/no-extraneous-dependencies */
import { toast } from 'react-toastify';

export const d2 = (num) => `00${num}`.slice(-2);

export const range = (length) => [...Array(length)].map((v, i) => i);

export const dateComparer = (dateA, dateB, desc = false) => {
  if (dateA < dateB) {
    return desc ? 1 : -1;
  }
  if (dateA > dateB) {
    return desc ? -1 : 1;
  }
  return 0;
};

export const dateStringComparer = (date1, date2, desc = false) => {
  const dateA = new Date(date1);
  const dateB = new Date(date2);
  if (dateA < dateB) {
    return desc ? 1 : -1;
  }
  if (dateA > dateB) {
    return desc ? -1 : 1;
  }
  return 0;
};

/**
 * changes first letter of words to uppercase and the rest lowercase.
 * @param {string} str
 */
export const capitalize = (str) => {
  if (!(str || str.length)) {
    return str;
  }

  if (str.length === 1) {
    return str.toUpperCase();
  }

  const parts = str.split(' ');
  if (parts.length === 1) {
    return `${str[0].toUpperCase()}${str.substring(1).toLowerCase()}`;
  }

  return parts.map((s) => `${s[0].toUpperCase()}${s.substring(1).toLowerCase()}`).join(' ');
};
export const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const months = {
  Jan: 'January',
  Feb: 'February',
  Mar: 'March',
  Apr: 'April',
  May: 'May',
  Jun: 'June',
  Jul: 'July',
  Aug: 'August',
  Sep: 'September',
  Oct: 'October',
  Nov: 'November',
  Dec: 'December',
};

export const monthKeys = Object.keys(months);

export const monthValues = Object.values(months);

export const eventRepeatsObject = {
  never: 'never',
  daily: 'daily',
  weekdays: 'weekdays',
  weekly: 'weekly',
  monthly: 'monthly',
  yearly: 'yearly',
};

export const eventRepeats = Object.keys(eventRepeatsObject);

export const eventHoldsOn = (event, date) => {
  if (event.repeats === eventRepeatsObject.daily) {
    return true;
  }

  const eventDate = new Date(event.date);

  if (event.repeats === eventRepeatsObject.weekly) {
    return eventDate.getDay() === date.getDay();
  }

  if (event.repeats === eventRepeatsObject.weekdays) {
    const day = date.getDay();
    return !(day === 0 || day === 6);
  }

  if (event.repeats === eventRepeatsObject.monthly) {
    return eventDate.getDate() === date.getDate();
  }

  if (event.repeats === eventRepeatsObject.yearly) {
    return eventDate.getDate() === date.getDate() && eventDate.getMonth() === date.getMonth();
  }

  return eventDate.getFullYear() === date.getFullYear()
    && eventDate.getMonth() === date.getMonth()
    && eventDate.getDate() === date.getDate();
};

export const getCalendarDays = (month, year, events = null) => {
  const lastMonthDays = []; // days we show from last month
  const currentMonthDays = []; // days this month
  const nextMonthDays = []; // days we show next month

  const firstWeekDayThisMonth = new Date(year, month, 1).getDay();
  if (firstWeekDayThisMonth > 0) {
    // zeroth day of this month is last day of last month
    const dateLastMonth = new Date(year, month, 0);
    const dateOfLastDateLastMonth = dateLastMonth.getDate();
    if (events) {
      for (let i = 0; i < firstWeekDayThisMonth; i += 1) {
        const d = dateOfLastDateLastMonth - i;
        dateLastMonth.setDate(d);
        lastMonthDays.unshift({
          date: d,
          events: events.filter((e) => eventHoldsOn(e, dateLastMonth)),
        });
      }
    } else {
      for (let i = 0; i < firstWeekDayThisMonth; i += 1) {
        lastMonthDays.unshift(dateOfLastDateLastMonth - i);
      }
    }
  }

  //  zeroth day next month is last day this month
  const dateThisMonth = new Date(year, month + 1, 0);
  const dateOfLastDateThisMonth = dateThisMonth.getDate();

  if (events) {
    for (let i = 1; i <= dateOfLastDateThisMonth; i += 1) {
      dateThisMonth.setDate(i);
      currentMonthDays.push({
        date: i,
        events: events.filter((e) => eventHoldsOn(e, dateThisMonth)),
      });
    }
  } else {
    for (let i = 1; i <= dateOfLastDateThisMonth; i += 1) {
      dateThisMonth.setDate(i);
      currentMonthDays.push(i);
    }
  }

  const dayOfLastMonthThisMonth = dateThisMonth.getDay();
  //  if this is not 6, we will have a partially filled row
  if (dayOfLastMonthThisMonth >= 0) {
    const dateNextMonth = new Date(year, month + 1, 1);
    if (events) {
      for (let i = 1; i <= 6 - dayOfLastMonthThisMonth; i += 1) {
        dateNextMonth.setDate(i);
        nextMonthDays.push({
          date: i,
          events: events.filter((e) => eventHoldsOn(e, dateNextMonth)),
        });
      }
    } else {
      for (let i = 1; i <= 6 - dayOfLastMonthThisMonth; i += 1) {
        nextMonthDays.push(i);
      }
    }
  }

  return {
    current: currentMonthDays,
    previous: lastMonthDays,
    next: nextMonthDays,
  };
};

export const getEventLocalTime = (event) => {
  const date = new Date().toISOString().match(/(.*)T/)[1];
  const startDate = new Date(`${date}T${event.start_time}+00:00`);
  const start = {
    hour: startDate.getHours(),
    minute: startDate.getMinutes(),
    text: `${d2(startDate.getHours())}:${d2(startDate.getMinutes())}`,
  };
  const end = { hour: 0, minute: 0, text: '--' };
  if (event.end_time) {
    const endDate = new Date(`${date}T${event.end_time}+00:00`);
    end.hour = endDate.getHours();
    end.minute = endDate.getMinutes();
    end.text = `${d2(endDate.getHours())}:${d2(endDate.getMinutes())}`;
  }

  return { start, end };
};

/**
 *
 * @param {string} str
 */
export const camelCase = (str) => {
  if (!str) {
    return '';
  }
  const parts = str.split('_').filter((s) => s);
  if (parts.length === 1) {
    return parts[0];
  }
  return parts.slice(1).reduce((memo, current) => (
    `${memo}${current[0].toUpperCase()}${current.substring(1)}`
  ), parts[0]);
};

export const LOCAL_TIME_DIFFERENCE = (() => {
  const date = new Date();
  return date.getTimezoneOffset() / -60;
  // const localHour = date.getHours();
  // const utcHour = parseInt(date.toISOString().match(/T(.*):/)[1], 10);
  // return localHour - utcHour;
})();

export const TIMEZONE = (() => {
  let timezone = 'GMT';
  if (LOCAL_TIME_DIFFERENCE > 0) {
    timezone = `${timezone} + ${d2(LOCAL_TIME_DIFFERENCE)}`;
  } else if (LOCAL_TIME_DIFFERENCE < 0) {
    timezone = `${timezone} - ${d2(-1 * LOCAL_TIME_DIFFERENCE)}`;
  }

  return timezone;
})();

/**
 * @param {string} time
 */
export const toLocalTime = (time) => {
  const parts = time.split(':').map((p) => Number.parseInt(p, 10));
  parts[0] += LOCAL_TIME_DIFFERENCE;
  return parts.map((p) => d2(p)).join(':');
};

/**
 * @param {string} time
 */
export const toUTCTime = (time) => {
  const parts = time.split(':').map((p) => Number.parseInt(p, 10));
  parts[0] -= LOCAL_TIME_DIFFERENCE;
  return parts.map((p) => d2(p)).join(':');
};

/**
 * Converts string to currency format
 * @param {string} value
 * @param {string} symbol
 * @returns {string}
 */
export const toCurrency = (value, symbol) => `${symbol || ''}${Number.parseFloat(value).toFixed(2)}`;

export const toDuration = (secs) => {
  const hr = Math.floor(secs / 3600);
  const rem = secs % 3600;
  const mins = Math.floor(rem / 60);
  const sec = rem % 60;

  return `${hr ? `${hr}${hr === 1 ? 'hr' : 'hrs'}` : ''} ${mins ? `${mins}${mins === 1 ? 'min' : 'mins'}` : ''} ${sec ? `${sec}${sec === 1 ? 'sec' : 'secs'}` : ''}`;
};

export const toTimeFormat = (secs) => {
  const hr = Math.floor(secs / 3600);
  const rem = secs % 3600;
  const mins = Math.floor(rem / 60);
  const sec = rem % 60;

  return `${d2(hr)}:${d2(mins)}${sec ? `:${d2(sec)}` : ''}`;
};

/**
 * @param {Date} date
 * @returns
 */
export const toInputTime = (date) => `${d2(date.getHours())}:${d2(date.getMinutes())}`;

export const imageColors = (() => {
  const canvas = document.createElement('canvas');
  canvas.style.width = '1000px';
  canvas.style.height = '1000px';
  const ctx = canvas.getContext('2d');
  const x = 10;
  const y = 10;

  const getColor = (src) => new Promise((resolve, reject) => {
    if (!ctx) {
      reject(new Error('function not available!'));
      return;
    }
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(x, y, 1, 1);
      resolve(data);
    };
    img.src = src;
  });

  return {
    getColor: (src) => new Promise((resolve, reject) => {
      getColor(src)
        .then(([r, g, b]) => resolve(`rgb(${r}, ${g}, ${b})`))
        .catch((err) => reject(err));
    }),
    getComplimentaryColors: (src, isBW) => new Promise((resolve, reject) => {
      getColor(src)
        .then(([r, g, b]) => {
          const bg = `rgb(${r}, ${g}, ${b})`;
          let fg;
          if (isBW) {
            fg = (r * 0.299 + g * 0.587 + b * 0.114) > 186
              ? '#000000'
              : '#FFFFFF';
          } else {
            fg = `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
          }
          resolve([bg, fg]);
        })
        .catch((err) => reject(err));
    }),
  };
})();

/**
 * Convert date to string of format YY-mm-dd
 * @param {Date | string} date
 */
export const dateToNormalizedString = (date) => {
  const lDate = date instanceof Date ? date : new Date(date);

  return `${lDate.getFullYear()}-${d2(lDate.getMonth() + 1)}-${d2(lDate.getDate())}`;
};

export const dateUtils = (() => {
  const weekdays = ['Sunday', 'Monday', 'Tueday', 'Wednesday', 'Thursday', 'Friday', 'Satday'];
  const weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat'];

  return {
    getWeekday: (index, short = false) => (short ? weekdaysShort[index] : weekdays[index]),
    toTimeFormat: (secs) => {
      const hr = Math.floor(secs / 3600);
      const rem = secs % 3600;
      const mins = Math.floor(rem / 60);
      const sec = rem % 60;

      return `${d2(hr)}:${d2(mins)}${sec ? `:${d2(sec)}` : ''}`;
    },
    /**
     * @param {string} time input time
     */
    fromTimeFormat: (time) => {
      const parts = time.split(':').map((p) => parseInt(p, 10));
      let result = 0;
      if (parts[0] && !Number.isNaN[0]) {
        result = 3600 * parts[0];
      }

      if (parts[1] && !Number.isNaN(parts[1])) {
        result += 60 * parts[1];
      }

      if (parts[2] && !Number.isNaN(parts[2])) {
        result += parts[2];
      }

      return result;
    },
    toLocalTimeInMinutes: (timeInMinutes, utcOffset) => {
      const hrs = Math.floor(timeInMinutes / 60) - utcOffset + LOCAL_TIME_DIFFERENCE;
      return (60 * hrs) + (timeInMinutes % 60);
    },
    /**
     * Convert date to string of format YY-mm-dd
     * @param {Date | string} date
     */
    toNormalizedString: (date) => {
      const lDate = date instanceof Date ? date : new Date(date);

      return `${lDate.getFullYear()}-${d2(lDate.getMonth() + 1)}-${d2(lDate.getDate())}`;
    },
    toDuration: (secs) => {
      const hr = Math.floor(secs / 3600);
      const rem = secs % 3600;
      const mins = Math.floor(rem / 60);
      const sec = rem % 60;

      return `${hr ? `${hr}${hr === 1 ? 'hr' : 'hrs'}` : ''} ${mins ? `${mins}${mins === 1 ? 'min' : 'mins'}` : ''} ${sec ? `${sec}${sec === 1 ? 'sec' : 'secs'}` : ''}`;
    },
    /**
     * @param {Date | string} inputDate
     */
    dateTimeToInputString: (inputDate) => {
      const date = inputDate instanceof Date ? inputDate : new Date(inputDate);
      if (Number.isNaN(date.getDate())) {
        return '';
      }

      return `${date.getFullYear()}-${d2(date.getMonth() + 1)}-${d2(date.getDate())}T${d2(date.getHours())}:${d2(date.getMinutes())}`;
    },
    /**
     * @param {Date | string} inputDate
     */
    toISOString: (inputDate) => {
      const date = inputDate instanceof Date ? inputDate : new Date(inputDate);
      return `${date.getUTCFullYear()}-${d2(date.getUTCMonth() + 1)}-${d2(date.getUTCDate())}T${d2(date.getUTCHours())}:${d2(date.getUTCMinutes())}:${d2(date.getUTCSeconds())}.000Z`;
    },
    /**
     * Date of sunday in inputDate's week.
     * @param {Date | string} inputDate
     */
    getWeekStartDate: (inputDate) => {
      const date = new Date(inputDate);
      date.setDate(date.getDate() - date.getDay());
      return date;
    },
    /**
     * @param {Date} date1
     * @param {Date} date2
     */
    dateEquals: (date1, date2) => (
      date1.getDate() === date2.getDate()
      && date1.getMonth() === date2.getMonth()
      && date1.getFullYear() === date2.getFullYear()
    ),
  };
})();

export const currencyHelper = {
  /**
   * @param {{ base: number, sub: number }} units
   * @returns
   */
  toNumber: (units) => (units.base * 100) + units.sub,
  /**
   * @param {number} amount
   * @returns
   */
  toUnits: (amount) => ({ base: Math.floor(amount / 100), sub: amount % 100 }),
  /**
   * @param {number} amount
   * @param {string} symbol
   * @returns
   */
  toString: (amount, symbol = '$') => `${symbol}${Math.floor(amount / 100)}.${d2(amount % 100)}`,
  fromDecimal: (amount, symbol) => `${symbol || ''}${Number.parseFloat(amount).toFixed(2)}`,
};

export const windowUtils = {
  open: (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.className = 'clip';
    link.setAttribute('noreferrer', true);
    link.referrerPolicy = 'no-referrer';
    link.target = 'Stripe';
    document.body.append(link);
    link.click();
    link.remove();
  },
};

const commonToastOptions = {
  autoClose: 6000,
  hideProgressBar: true,
  position: toast.POSITION.BOTTOM_RIGHT,
  pauseOnHover: true,
};

export const toastOptions = {
  DEFAULT: { ...commonToastOptions, type: toast.TYPE.DEFAULT },
  ERROR: { ...commonToastOptions, type: toast.TYPE.ERROR },
  INFO: { ...commonToastOptions, type: toast.TYPE.INFO },
  SUCCESS: { ...commonToastOptions, type: toast.TYPE.SUCCESS },
  WARNING: { ...commonToastOptions, type: toast.TYPE.WARNING },
};

export const notification = {
  showError: (msg) => toast(msg, toastOptions.ERROR),
  showInfo: (msg) => toast(msg, toastOptions.INFO),
  showSuccess: (msg) => toast(msg, toastOptions.SUCCESS),
  showWarning: (msg) => toast(msg, toastOptions.WARNING),
};
