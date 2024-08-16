import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Modal from '../Modal';

const DeletedModal = ({
  isOpen, onClose, countryName,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
    >
      <div className="py-6 px-8">
        <div className=" mb-8 mt-12">
          <CheckCircleIcon className="text-green-500 mx-auto mb-4 w-16" />
          <h3 className="text-2xl font-semibold mb-4">Deleted!</h3>
          <p className="text-md text-gray-400 mb-12 max-w-md">
            {`You have successfully deleted ${countryName}.`}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-10 py-2 bg-black text-white text-sm rounded-xl hover:bg-blue-600 focus:outline-none transition duration-150 ease-in-out"
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
};

DeletedModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  countryName: PropTypes.string.isRequired,
};

export default DeletedModal;
