import { useState } from 'react';
import PropTypes from 'prop-types';
import { PencilIcon } from '@heroicons/react/24/outline';
import Modal from '../Modal';
import { Input } from '../TextBox';
import { Heading1 } from '../../containers/Aside';

const FieldEditor = ({
  name,
  label,
  initialValue,
  isOpen,
  setOpen,
  onEdit,
}) => {
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setBusy(true);
    onEdit(name, value, (err) => {
      setBusy(false);
      if (!err) {
        setOpen(false);
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen || busy}
      parentSelector={() => document.querySelector('#root')}
      onRequestClose={() => {
        if (!busy) {
          setOpen(false);
        }
      }}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      style={{ content: { maxWidth: 420 } }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-6 px-8">
        <Heading1>Edit User</Heading1>
        <Input
          type="text"
          name={name}
          value={value}
          label={label}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex items-center justify-end pt-4">
          <button type="submit" className={`btn ${busy ? 'busy' : ''}`}>
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
};

FieldEditor.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  initialValue: PropTypes,
  isOpen: PropTypes.bool,
  setOpen: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
};

FieldEditor.defaultProps = {
  initialValue: '',
  isOpen: false,
  onEdit: null,
};

const FieldRow = ({
  name,
  value,
  label,
  onEdit,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex items-center">
      <span className="min-w-40 sm:min-w-60 font-semibold text-[#011c39] dark:text-gray">
        {label}
      </span>
      <div
        className="w-67 border border-[#E9EBF8] dark:border-[#334255] rounded-lg p-3 flex items-center justify-between"
      >
        <span>{value}</span>
        {onEdit ? (
          <button
            aria-label="Edit"
            title="Edit"
            type="button"
            className="bg-transparent p-0 cursor-pointer"
            onClick={() => setModalOpen(true)}
          >
            <PencilIcon className="w-5 h-5 text-[#8E98A8]" />
          </button>
        ) : null}
      </div>
      {onEdit ? (
        <FieldEditor
          name={name}
          label={label}
          initialValue={value}
          onEdit={onEdit}
          isOpen={isModalOpen}
          setOpen={setModalOpen}
        />
      ) : null}
    </div>
  );
};

FieldRow.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  label: PropTypes.string.isRequired,
  onEdit: PropTypes.func,
};

FieldRow.defaultProps = {
  value: '',
  name: '',
  onEdit: null,
};

export default FieldRow;
