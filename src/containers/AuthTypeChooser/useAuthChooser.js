import PropTypes from 'prop-types';
import css from './style.module.css';
import { useDialog } from '../../lib/Dialog';

const stopPropagation = (e) => e.stopPropagation();

const ChooserDialog = ({ onCompanySelected, onUserSelected, onClose }) => (
  <div className="dialog" role="button" tabIndex={0} onMouseDown={onClose}>
    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
    <div className={`bold-dialog-body ${css.links_wrap}`} onMouseDown={stopPropagation}>
      <button type="button" className={css.link} onClick={onUserSelected}>
        I am a user
      </button>
      <button type="button" className={css.link} onClick={onCompanySelected}>
        I am a service provider
      </button>
    </div>
  </div>
);

ChooserDialog.propTypes = {
  onCompanySelected: PropTypes.func.isRequired,
  onUserSelected: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

const useAuthChooser = () => {
  const dialog = useDialog();

  return {
    show: (onCompanySelected, onUserSelected) => {
      let popup;
      const handleClose = () => popup.close();
      const handleCompanySelected = () => {
        popup.close();
        onCompanySelected();
      };
      const handleUserSelected = () => {
        popup.close();
        onUserSelected();
      };

      popup = dialog.show(
        <ChooserDialog
          onCompanySelected={handleCompanySelected}
          onUserSelected={handleUserSelected}
          onClose={handleClose}
        />,
      );
    },
  };
};

export default useAuthChooser;
