import {
  forwardRef,
  useCallback,
  useEffect,
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

export const matchesEmail = (email) => /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(email);

export const matchesPhoneNumber = (number) => (
  /^[+]?[\s./0-9]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/g.test(number)
);

export const isNumber = (number) => /^-?\d*\.?\d*$/.test(number);

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
          list={options ? options.listId : null}
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
  options: PropTypes.shape({
    listId: PropTypes.string,
    list: PropTypes.arrayOf(PropTypes.string),
  }),
  hideErrorOnNull: PropTypes.bool,
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
  options: null,
  hideErrorOnNull: false,
};

export const FieldEditor = ({
  name,
  label,
  type,
  initialValue,
  onSave,
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
      setValue(value);
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
      <div className={css.field_wrap}>
        <span className={css.input_label_text}>{label}</span>
        <div className={css.field_row}>
          <span className={css.field_value} title={value}>{value}</span>
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
    <form className={css.field_wrap} onSubmit={handleSubmit}>
      <span className={css.input_label_text}>{label}</span>
      <div className={css.field_row}>
        <TextBox
          ref={textbox}
          id={name}
          type={type}
          name={VALUE}
          value={value}
          containerStyle={{ marginBottom: 0 }}
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
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  initialValue: PropTypes.string,
  onSave: PropTypes.func.isRequired,
};

FieldEditor.defaultProps = {
  initialValue: '',
  type: 'text',
};

export default TextBox;
