/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from 'react';
import Modal from '../../../../components/Modal';
import MenuSelect from '../../../../components/Inputs/MenuSelect';

const TITLE = 'title';
const START = 'start';
const END = 'end';
const REPEATS = 'repeats';

const repeatOptions = ['Does not repeat', 'Repeats annually'];

const TimeOffs = () => {
  const [busy, setBusy] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [fields, setFields] = useState({
    [END]: '',
    [START]: '',
    [TITLE]: '',
    [REPEATS]: repeatOptions[0],
  });

  const handleValueChange = ({ target: { name, value } }) => setFields(
    (fields) => ({ ...fields, [name]: value }),
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => setBusy(false), 5000);
  };

  return (
    <div id="time-off-panel">
      <button
        type="button"
        onClick={() => setFormOpen(true)}
        className="bg-transparent border-none outline-none font-normal text-sm text-[#5346cc] p-0 cursor-pointer"
      >
        Add time off
      </button>
      <Modal
        isOpen={formOpen || busy}
        parentSelector={() => document.querySelector('#time-off-panel')}
        onRequestClose={() => {
          if (!busy) {
            setFormOpen(false);
          }
        }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <form
          onSubmit={handleSubmit}
          className="modal-bold-body max-h-[80vh] overflow-auto relative"
        >
          <div className="flex flex-col gap-3">
            <h1 className="m-0 font-semibold text-2xl text-center text-[#011c39]">
              Add time off
            </h1>
            <h2 className="font-normal p-0 text-sm text-[#011c30] text-center">
              Add a time off to your schedule
            </h2>
          </div>
          <label htmlFor={TITLE} className="bold-select-wrap">
            <input
              type="text"
              name={TITLE}
              id={TITLE}
              value={fields[TITLE]}
              onChange={handleValueChange}
              className="text-input"
              placeholder="Title"
            />
          </label>
          <div className="flex gap-6">
            <label htmlFor={START} className="bold-select-wrap flex-1">
              <span className="label">Start Date</span>
              <input
                type="date"
                name={START}
                id={START}
                value={fields[START]}
                onChange={handleValueChange}
                className="text-input"
                placeholder="Start Date"
              />
            </label>
            <label htmlFor={END} className="bold-select-wrap flex-1">
              <span className="label">End Date</span>
              <input
                type="date"
                name={END}
                id={END}
                value={fields[END]}
                onChange={handleValueChange}
                className="text-input"
                placeholder="End Date"
              />
            </label>
          </div>
          <div>
            <MenuSelect
              value={fields[REPEATS]}
              options={repeatOptions}
              onSelect={(value) => setFields((fields) => ({ ...fields, [REPEATS]: value }))}
            />
          </div>
          <div className="flex justify-end gap-5">
            <button
              type="button"
              onClick={() => {
                if (!busy) {
                  setFormOpen(false);
                }
              }}
              className="py-2 px-3 rounded-lg bg-[#e9ebf8] font-medium text-base text-[#011c39] w-[176px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-3 rounded-lg bg-[#011c39] text-white text-base font-medium w-[176px] disabled:bg-[#e9ebf8]"
              disabled={busy}
            >
              Add
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TimeOffs;
