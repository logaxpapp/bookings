/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router';
import { TrashIcon } from '@heroicons/react/24/outline';
import Modal from '../../../../components/Modal';
import MenuSelect from '../../../../components/Inputs/MenuSelect';
import { addCompanyTimeOffAsync, deleteCompanyTimeOffAsync } from '../../../../redux/companySlice';

const TITLE = 'title';
const START = 'start';
const END = 'end';
const REPEATS = 'repeats';

const repeatOptions = ['never', 'annually'];

const TimeOffs = () => {
  const [busy, setBusy] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ timeOff: null, busy: false });
  const [fields, setFields] = useState({
    [END]: '',
    [START]: '',
    [TITLE]: '',
    [REPEATS]: repeatOptions[0],
  });
  const [company] = useOutletContext();
  const dispatch = useDispatch();

  const handleValueChange = ({ target: { name, value } }) => setFields(
    (fields) => ({ ...fields, [name]: value }),
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setBusy(true);
    const data = { ...fields, repeats: repeatOptions.indexOf(fields.repeats) };
    dispatch(addCompanyTimeOffAsync(data, (err) => {
      setBusy(false);

      if (!err) {
        setFormOpen(false);
      }
    }));
  };

  const handleDelete = () => {
    const id = deleteModal.timeOff?.id;

    if (!id) {
      return;
    }

    setDeleteModal((modal) => ({ ...modal, busy: true }));

    dispatch(deleteCompanyTimeOffAsync(id, (err) => {
      setDeleteModal((modal) => ({
        busy: false,
        timeOff: err ? modal.timeOff : null,
      }));
    }));
  };

  return (
    <div id="time-off-panel">
      {company.timeOffs.length ? (
        <div className="pb-6 max-w-[640px]">
          {company.timeOffs.map((timeOff) => (
            <section key={timeOff.id} className="flex flex-col gap-2 p-2 border border-slate-200 rounded">
              <h1 className="text-lg font-semibold mb-0">
                {timeOff.title}
              </h1>
              <div className="font-normal text-sm">
                {`${timeOff.start} - ${timeOff.end}`}
              </div>
              <div className="flex items-center justify-between">
                <div className="font-normal text-sm">
                  <span>Repeats: </span>
                  <span className="capitalize">
                    {timeOff.repeats}
                  </span>
                </div>
                <div>
                  <button
                    type="button"
                    aria-label="delete"
                    className="bg-transparent border-none outline-none"
                    onClick={() => setDeleteModal({ timeOff, busy: false })}
                  >
                    <TrashIcon aria-hidden="true" className="w-[18px] h-[18px]" stroke="#b61818" />
                  </button>
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : null}
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
      <Modal
        isOpen={!!deleteModal.timeOff || deleteModal.busy}
        parentSelector={() => document.querySelector('#time-off-panel')}
        onRequestClose={() => {
          if (!deleteModal.busy) {
            setDeleteModal({ timeOff: null, busy: false });
          }
        }}
        style={{ content: { maxWidth: 400 } }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <div className="py-5 px-8">
          <p className="m-0 px-4 flex flex-col gap-3">
            <span className="font-medium text-lg">
              {`The time off ${deleteModal.timeOff?.title} will be permanently deleted!`}
            </span>
            <span className="text-lg font-semibold text-center">
              Do yo wish to continue?
            </span>
          </p>
          <div className="pt-6 px-4 flex items-center justify-end">
            <button
              type="button"
              className={`btn danger ${deleteModal.busy ? 'busy' : ''}`}
              onClick={handleDelete}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TimeOffs;
