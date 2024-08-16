import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import css from './style.module.css';
import { SvgButton, paths } from '../svg';
import { Ring } from '../LoadingButton';

const CANCEL = 'cancel';
const EDIT = 'edit';
const SAVE = 'save';
const VALUE = 'value';

const digits = '0123456789';
const lowerCases = 'abcdefghijklmnopqrstuvwxyz';
const upperCases = lowerCases.toUpperCase();
const specialCharacters = ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

export const matchesEmail = (email) => /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(email);

export const matchesPhoneNumber = (number) => (
  /^[+]?[\s./0-9]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/g.test(number)
);

export const isNumber = (number) => /^-?\d*\.?\d*$/.test(number);

/**
 * @param {string} password
 */
export const validatePassword = (password) => {
  const criteria = {
    hasLowerCase: false,
    hasUpperCase: false,
    hasDigit: false,
    hasSpecialCharacter: false,
    satisfiesMinLength: false,
    isValid: false,
  };

  if (!password) {
    return criteria;
  }

  if (password.length >= 8) {
    criteria.satisfiesMinLength = true;
  }

  password.split('').forEach((c) => {
    if (lowerCases.indexOf(c) > -1) {
      criteria.hasLowerCase = true;
    } else if (upperCases.indexOf(c) > -1) {
      criteria.hasUpperCase = true;
    } else if (digits.indexOf(c) > -1) {
      criteria.hasDigit = true;
    } else if (specialCharacters.indexOf(c) > -1) {
      criteria.hasSpecialCharacter = true;
    }
  });

  criteria.isValid = criteria.hasDigit
    && criteria.hasLowerCase
    && criteria.hasUpperCase
    && criteria.hasSpecialCharacter
    && criteria.satisfiesMinLength;

  return criteria;
};

export const parseIntegerInput = (text) => {
  if (!text) {
    return '';
  }

  return Number.parseInt(text, 10);
};

/**
 * @param {string} str
 * @returns
 */
export const parseAmount = (str) => {
  if (!str) {
    return '';
  }
  let rslt = str;
  const idx = str.indexOf('.');

  if (idx >= 0) {
    const parts = str.split('.');
    rslt = `${parts[0]}.${parts[1].substring(0, 2)}`;
  }

  if (Number.isNaN(rslt)) {
    return '';
  }

  let post = '';
  if (rslt.endsWith('.')) {
    post = '.';
  } else if (rslt.endsWith('.00')) {
    post = '.00';
  } else if (rslt.endsWith('.0')) {
    post = '.0';
  } else if (rslt.endsWith('0')) {
    const parts = rslt.split('.');
    if (parts.length === 2) {
      post = '0';
    }
  }

  rslt = Number.parseFloat(rslt);

  if (Number.isNaN(rslt)) {
    return '';
  }

  return `${rslt}${post}`;
};

/**
 * @param {string} str
 * @returns
 */
export const parseDuration = (str) => {
  if (!str) {
    return '';
  }
  let rslt = str;
  const idx = str.indexOf(':');
  if (idx < 0) {
    return rslt === '00' ? '00' : Number.parseInt(rslt, 10);
  }

  const parts = rslt.split(':');

  [rslt] = parts;
  if (rslt && rslt !== '00') {
    rslt = Number.parseInt(rslt, 10);
    if (Number.isNaN(rslt)) {
      rslt = '';
    }
  }

  let mins = parts[1];
  if (mins.indexOf('.') >= 0) {
    mins = mins.substring(mins.indexOf('.'));
  }
  if (mins) {
    mins = mins.substring(0, 2);
    const post = mins.endsWith('00') ? '0' : '';
    mins = Number.parseInt(mins, 10);
    if (Number.isNaN(mins)) {
      rslt = `${rslt}:${post}`;
    } else {
      if (mins >= 60) {
        const hr = Math.floor(mins / 60);
        rslt = typeof rslt === 'number' ? rslt + hr : hr;
        mins %= 60;
      }

      rslt = `${rslt}:${mins}`;
    }
  } else {
    rslt += ':';
  }

  return rslt;
};

/**
 * @param {string} str
 */
export const getAmount = (str) => {
  if (!str) {
    return 0;
  }

  if (typeof str === 'number') {
    return str;
  }

  const parts = str.split('.').map((p) => (Number.isNaN(p) ? 0 : Number.parseInt(p, 10)));
  if (!parts.length) {
    return 0;
  }

  let amount = 100 * parts[0];
  if (parts.length > 1) {
    amount += parts[1];
  }

  return amount;
};

/**
 * @param {string} str
 */
export const getDuration = (str) => {
  if (!str) {
    return 0;
  }
  if (typeof str === 'number') {
    return 3600 * str;
  }
  const parts = str.split(':').map((p) => (Number.isNaN(p) ? 0 : Number.parseInt(p, 10)));
  if (!parts.length) {
    return 0;
  }

  let duration = 3600 * parts[0];
  if (parts.length > 1) {
    duration += 60 * parts[1];
  }
  if (parts.length > 2) {
    duration += parts[2];
  }

  return duration;
};

export const getDurationText = (num) => {
  let number = Number.parseInt(num, 10);
  let duration = '0:';
  if (number >= 3600) {
    duration = `${Math.floor(number / 3600)}:`;
    number %= 3600;
  }

  duration = `${duration}${Math.floor(number / 60)}`;
  number %= 60;
  if (number) {
    duration = `${duration}:${number}`;
  }

  return duration;
};

const ErrorComponent = ({ error, hideErrorOnNull }) => {
  if (hideErrorOnNull) {
    if (error) {
      return <span className={css.input_error}>{error}</span>;
    }
    return null;
  }

  return <span className={`${css.input_error} ${error ? css.show : ''}`}>{error}</span>;
};

ErrorComponent.propTypes = {
  error: PropTypes.string,
  hideErrorOnNull: PropTypes.bool,
};

ErrorComponent.defaultProps = {
  error: null,
  hideErrorOnNull: false,
};

/* eslint-disable prefer-arrow-callback */

/**
 * @param {Object} props
 * @param {import('../../types').NamedStyle} props.style
 * @param {import('../../types').NamedStyle} props.containerStyle
 */
const TextBox = forwardRef(function TextBox({
  id,
  type,
  name,
  value,
  label,
  labelRider,
  error,
  style,
  containerStyle,
  className,
  onChange,
  tabIndex,
  options,
  placeholder,
  title,
  readOnly,
  hideErrorOnNull,
}, ref) {
  return (
    <label htmlFor={id} className={css.input_label} style={containerStyle}>
      {label ? (
        <div className={css.input_label_text}>
          <span>{label}</span>
          {labelRider ? (
            <span className={css.input_label_text_rider}>{`[${labelRider}]`}</span>
          ) : null}
        </div>
      ) : null}
      <div className={`${css.input_wrap} ${className}`} style={style}>
        <input
          ref={ref}
          id={id}
          type={type}
          name={name}
          value={value}
          className={css.input}
          onChange={onChange}
          tabIndex={tabIndex}
          placeholder={placeholder}
          title={title}
          list={options ? options.listId : null}
          readOnly={readOnly}
        />
      </div>
      <ErrorComponent error={error} hideErrorOnNull={hideErrorOnNull} />
      {options ? (
        <datalist id={options.listId}>
          {options.list.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </datalist>
      ) : null}
    </label>
  );
});

/**
 * @param {Object} props
 * @param {import('../../types').NamedStyle} props.style
 * @param {import('../../types').NamedStyle} props.containerStyle
 */
export const Password = forwardRef(function Password({
  id,
  name,
  value,
  label,
  labelRider,
  error,
  style,
  containerStyle,
  className,
  onChange,
  tabIndex,
  placeholder,
  title,
  readOnly,
  hideErrorOnNull,
  canUnmask,
}, ref) {
  const [type, setType] = useState('password');

  const toggleType = () => setType((type) => (type === 'password' ? 'text' : 'password'));

  return (
    <label htmlFor={id} className={css.input_label} style={containerStyle}>
      {label ? (
        <div className={css.input_label_text}>
          <span>{label}</span>
          {labelRider ? (
            <span className={css.input_label_text_rider}>{`[${labelRider}]`}</span>
          ) : null}
        </div>
      ) : null}
      <div className={`${css.input_wrap} ${className}`} style={style}>
        <input
          ref={ref}
          id={id}
          type={type}
          name={name}
          value={value}
          className={css.input}
          onChange={onChange}
          tabIndex={tabIndex}
          placeholder={placeholder}
          title={title}
          readOnly={readOnly}
        />
        {canUnmask ? (
          <SvgButton
            color="#7c8b99"
            title="Toggle"
            onClick={toggleType}
            path={type === 'password' ? paths.eye : paths.eyeOff}
            style={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          />
        ) : null}
      </div>
      <ErrorComponent error={error} hideErrorOnNull={hideErrorOnNull} />
    </label>
  );
});

/* eslint-enable prefer-arrow-callback */

TextBox.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  label: PropTypes.string,
  labelRider: PropTypes.string,
  error: PropTypes.string,
  style: PropTypes.shape({}),
  containerStyle: PropTypes.shape({}),
  className: PropTypes.string,
  onChange: PropTypes.func,
  tabIndex: PropTypes.number,
  placeholder: PropTypes.string,
  title: PropTypes.string,
  options: PropTypes.shape({
    listId: PropTypes.string,
    list: PropTypes.arrayOf(PropTypes.string),
  }),
  hideErrorOnNull: PropTypes.bool,
  readOnly: PropTypes.bool,
};

TextBox.defaultProps = {
  type: 'text',
  value: '',
  label: '',
  labelRider: '',
  error: '',
  style: {},
  containerStyle: {},
  className: '',
  onChange: null,
  tabIndex: 0,
  placeholder: '',
  title: null,
  options: null,
  hideErrorOnNull: false,
  readOnly: false,
};

Password.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  label: PropTypes.string,
  labelRider: PropTypes.string,
  error: PropTypes.string,
  style: PropTypes.shape({}),
  containerStyle: PropTypes.shape({}),
  className: PropTypes.string,
  onChange: PropTypes.func,
  tabIndex: PropTypes.number,
  placeholder: PropTypes.string,
  title: PropTypes.string,
  hideErrorOnNull: PropTypes.bool,
  readOnly: PropTypes.bool,
  canUnmask: PropTypes.bool,
};

Password.defaultProps = {
  value: '',
  label: '',
  labelRider: '',
  error: '',
  style: {},
  containerStyle: {},
  className: '',
  onChange: null,
  tabIndex: 0,
  placeholder: '',
  title: null,
  hideErrorOnNull: false,
  readOnly: false,
  canUnmask: false,
};

export const Input = ({
  name,
  id,
  value,
  type,
  label,
  error,
  style,
  className,
  placeholder,
  onChange,
}) => {
  const inputStyle = useMemo(() => {
    const s = style ? { ...style } : {};
    if (error) {
      s.borderColor = '#c51306';
    }

    return s;
  }, [error, style]);

  return (
    <label htmlFor={id || name} className="bold-select-wrap">
      {label ? <span className="label dark:text-white">{label}</span> : null}
      <input
        type={type}
        name={name}
        id={id || name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={`text-input bg-white dark:bg-meta-4 dark:border dark:border-[#334255] dark:text-white ${className || ''}`}
        style={inputStyle}
      />
      {error ? <span className="input-error">{error}</span> : null}
    </label>
  );
};

Input.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  name: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  type: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  style: PropTypes.shape({}),
  containerStyle: PropTypes.shape({}),
  className: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

Input.defaultProps = {
  id: null,
  name: null,
  value: '',
  label: '',
  type: 'text',
  placeholder: '',
  error: '',
  style: {},
  containerStyle: {},
  className: '',
  onChange: null,
};

/**
 * @param {Object} props
 * @param {import('../../types').NamedStyle} props.style
 */
export const FieldEditor = ({
  name,
  label,
  type,
  style,
  inputStyle,
  initialValue,
  onSave,
  isInteger,
  transparent,
}) => {
  const [value, setValue] = useState('');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const textbox = useRef(null);

  useEffect(() => setValue(initialValue), [initialValue, setValue]);

  useEffect(() => {
    if (editing) {
      const input = textbox.current;
      if (input) {
        input.focus();
      }
    }
  }, [editing]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === EDIT) {
      setEditing(true);
    } else if (name === CANCEL) {
      setValue(initialValue);
      setEditing(false);
    }
  }, [initialValue, setValue, setEditing]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === VALUE) {
      setValue(isInteger ? parseIntegerInput(value) : value);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (value === initialValue) {
      return;
    }

    setBusy(true);
    onSave(name, value, (err) => {
      setBusy(false);
      if (!err) {
        setEditing(false);
      }
    });
  }, [value, initialValue, name, onSave, setBusy]);

  if (!editing) {
    return (
      <div className={css.field_wrap} style={style}>
        {label ? <span className={css.input_label_text}>{label}</span> : null}
        <div
          className={css.field_row}
          style={{ backgroundColor: transparent ? 'transparent' : '#eef3f3' }}
        >
          <span style={inputStyle} className={css.field_value} title={value}>{value}</span>
          <SvgButton
            type="button"
            name={EDIT}
            path={paths.pencil}
            onClick={handleClick}
            title="Edit"
            xsm
          />
        </div>
      </div>
    );
  }

  return (
    <form className={css.field_wrap} onSubmit={handleSubmit} style={style}>
      {label ? <span className={css.input_label_text}>{label}</span> : null}
      <div className={css.field_row}>
        <TextBox
          ref={textbox}
          id={name}
          type={type}
          name={VALUE}
          value={value}
          containerStyle={{ marginBottom: 0 }}
          style={inputStyle}
          onChange={handleValueChange}
          hideErrorOnNull
        />
        {busy ? (
          <Ring color="gray" size={18} />
        ) : (
          <>
            {initialValue === value ? null : (
              <SvgButton
                type="submit"
                name={SAVE}
                path={paths.save}
                onClick={handleClick}
                title="Save"
                sm
              />
            )}
            <SvgButton
              type="button"
              name={CANCEL}
              path={paths.close}
              onClick={handleClick}
              title="Cancel"
              color="#af0d0d"
              sm
            />
          </>
        )}
      </div>
    </form>
  );
};

FieldEditor.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  initialValue: PropTypes.string,
  style: PropTypes.shape({}),
  inputStyle: PropTypes.shape({}),
  onSave: PropTypes.func.isRequired,
  isInteger: PropTypes.bool,
  transparent: PropTypes.bool,
};

FieldEditor.defaultProps = {
  initialValue: '',
  type: 'text',
  label: '',
  style: undefined,
  inputStyle: {},
  isInteger: false,
  transparent: false,
};

export default TextBox;
