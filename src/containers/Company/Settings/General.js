import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heading } from '../../Aside';
import { selectPreferences, updatePreferencesAsync } from '../../../redux/companySlice';

const LANGUAGE = 'language';
const UPDATE = 'update';

const supportedLaguages = [
  'English (US)',
  'English (UK)',
];

const camelCases = {
  [LANGUAGE]: LANGUAGE,
};

const General = () => {
  const preferences = useSelector(selectPreferences);
  const [fields, setFields] = useState({
    [LANGUAGE]: preferences[camelCases[LANGUAGE]],
  });
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();

  const changedFields = Object.keys(fields).filter(
    (key) => preferences[camelCases[key]] !== fields[key],
  );

  const hasChanges = Object.keys(changedFields).length;

  const handleClick = ({ target: { name } }) => {
    if (name === UPDATE) {
      if (hasChanges) {
        setBusy(true);
        const data = changedFields.reduce((memo, key) => ({ ...memo, [key]: fields[key] }), {});
        dispatch(updatePreferencesAsync(data, () => setBusy(false)));
      }
    }
  };

  const handleValueChange = ({ target: { name, value } }) => (
    setFields((fields) => ({ ...fields, [name]: value }))
  );

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <section>
      <header className="flex items-center justify-between">
        <Heading>General</Heading>
        {hasChanges ? (
          <button
            type="button"
            name={UPDATE}
            className={`btn ${busy ? 'busy' : ''}`}
            onClick={handleClick}
            disabled={busy}
          >
            Update
          </button>
        ) : null}
      </header>
      <form onSubmit={handleSubmit} className="modal-bold-body max-h-[80vh] overflow-auto">
        <label htmlFor={LANGUAGE} className="bold-select-wrap max-w-lg">
          <span className="label">Preferred Language</span>
          <div className="bold-select caret bg-[#f8fafc] border border-[#cbd5e1]">
            <select
              name={LANGUAGE}
              id={LANGUAGE}
              value={fields[LANGUAGE] || ''}
              onChange={handleValueChange}
            >
              <option value="" disabled>-- Select Language --</option>
              {supportedLaguages.map((lang) => (
                <option value={lang} key={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </label>
      </form>
    </section>
  );
};

export default General;
