import { useState } from 'react';
import { Heading } from '../../Aside';

const PREFERRED_LANGUAGE = 'preferredLanguage';

const supportedLaguages = [
  'English (US)',
  'English (UK)',
];

const General = () => {
  const [fields, setFields] = useState({
    [PREFERRED_LANGUAGE]: supportedLaguages[0],
  });

  const handleValueChange = ({ target: { name, value } }) => (
    setFields((fields) => ({ ...fields, [name]: value }))
  );

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <section>
      <Heading>General</Heading>
      <form onSubmit={handleSubmit} className="modal-bold-body max-h-[80vh] overflow-auto">
        <label htmlFor={PREFERRED_LANGUAGE} className="bold-select-wrap max-w-lg">
          <span className="label">Preferred Language</span>
          <div className="bold-select caret bg-[#f8fafc] border border-[#cbd5e1]">
            <select
              name={PREFERRED_LANGUAGE}
              id={PREFERRED_LANGUAGE}
              value={fields.preferredLanguage}
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
