import { Heading } from '../../Aside';
import { usePrefereceFields } from '../../../utils/hooks';

const LANGUAGE = 'language';
const UPDATE = 'update';

const supportedLaguages = [
  'English (US)',
  'English (UK)',
];

const General = () => {
  const {
    busy,
    hasChanges,
    fields,
    setFields,
    update,
  } = usePrefereceFields([LANGUAGE]);

  const handleClick = ({ target: { name } }) => {
    if (name === UPDATE) {
      update();
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
