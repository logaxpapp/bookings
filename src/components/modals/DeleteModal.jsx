import PropTypes from 'prop-types';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Modal from '../Modal';

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  text1,
  text2,
}) => {
  const handleDeleteConfirm = () => {
    onConfirm();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        style={{ content: { width: '480px' } }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <section className="p-8">
          <ExclamationTriangleIcon className="text-gray-400 mx-auto mb-4 w-12 text-red-700" />
          <h1 className="text-2xl font-medium text-center mb-8">{text1}</h1>
          <p className="mb-20 text-lg text-gray-500 text-center">{text2}</p>
          <div className="flex justify-center gap-8">
            <button
              type="button"
              onClick={onClose}
              className="px-12 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-12 py-2 bg-red-500 text-white rounded-xl hover:bg-red-700 focus:outline-none"
            >
              Delete
            </button>
          </div>
        </section>
      </Modal>
    </>
  );
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func.isRequired,
  text1: PropTypes.string,
  text2: PropTypes.string,
};

DeleteModal.defaultProps = {
  onClose: null,
  text1: 'Resource will be permanently deleted.',
  text2: 'Do you wish to continue?',
};

export default DeleteModal;
