import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { SvgButton, colors, paths } from './svg';
import LoadingButton from './LoadingButton';
import SlideDialog from './SlideInDialog';
import { useDialog } from '../lib/Dialog';
import defaultImages from '../utils/defaultImages';
import { useBusyDialog } from './LoadingSpinner';

/**
 * @callback ErrorFirstCallback
 * @param {string | undefined} error
 * @returns {void}
 */

/**
 * @callback FileHandlerCallback
 * @param {File} file
 * @param {ErrorFirstCallback} callback
 * @returns {void}
 */

const styles = {
  panel: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    minWidth: '250px',
    padding: '0',
    borderRadius: '4px',
    backgroundColor: 'transparent',
  },
  pictureWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1.1,
  },
  picture: {
    width: '100%',
    height: '100%',
  },
  fileBtn: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
    padding: 5,
    gap: 10,
    backgroundColor: '#fff',
    border: 'none',
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
    fontSize: '0.6rem',
    fontWeight: 'bold',
    borderBottom: '1px dotted #202936',
  },
  closeBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  loadingBtn: {
    fontWeight: 'bold',
    fontSize: '0.8rem',
    padding: '12px 0',
    borderRadius: '0 0 4px 4px',
  },
  noFile: {
    fontWeight: 'bold',
    fontSize: '0.8rem',
    padding: '12px 0',
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#9d0606',
    borderRadius: '0 0 4px 4px',
    margin: '30px 8px 8px',
  },
  noFilePad: {
    padding: '0 8px 8px 8px',
  },
  cover: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  error: {
    display: 'block',
    fontWeight: 'bold',
    fontSize: '0.7rem',
    textAlign: 'center',
    padding: 8,
    overflow: 'auto',
    color: '#721c24',
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  bodyWrap: {
    backgroundColor: '#fff',
    borderRadius: '0 0 4px 4px',
    flex: 1,
    flexDirection: 'column',
    display: 'flex',
  },
  footer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
};

const FILE_BTN = 'flie btn';
const UPLOAD = 'upload';
const OPEN_DIALOG_PROMPT = 'Please Choose An Image';
const BUTTON_TEXT = 'Upload Image';
const ASPECT_RATIO = 1;
const MAX_IMAGE_HEIGHT = 180;

const ImageUploader = ({
  onValidate,
  onClose,
  onSubmit,
  openDialogPrompt,
  buttonText,
  previewPlaceholder,
  aspectRatio,
  maxImageHeight,
}) => {
  const [file, setFile] = useState({ input: null, preview: null });
  const [error, setError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [defaultPreview, setDefaultPreview] = useState();
  const fileInput = useRef(null);

  useEffect(() => {
    setDefaultPreview(previewPlaceholder || defaultImages.profile);
  }, [previewPlaceholder, setDefaultPreview]);

  const setInputFile = useCallback((file) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => setFile({ input: file, preview: reader.result }));
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = useCallback(({ target: { files } }) => {
    const file = files && files[0];
    if (file) {
      if (onValidate) {
        onValidate(file, (error) => {
          setError(error || '');
          if (!error) {
            setInputFile(file);
          }
        });
      } else {
        setInputFile(file);
      }
    }
  }, [setInputFile, setError, onValidate]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === FILE_BTN) {
      fileInput.current.click();
    } else if (name === UPLOAD) {
      setUploading(true);
      onSubmit(file.input, (error) => {
        setUploading(false);
        setError(error || '');
        if (!error && onClose) {
          onClose();
        }
      });
    }
  }, [file, onSubmit, onClose, setUploading, setError]);

  return (
    <div style={styles.panel}>
      {error ? <div style={styles.error}>{error}</div> : null}
      <input ref={fileInput} type="file" className="clip" onChange={handleFileChange} />
      <div
        style={{
          ...styles.pictureWrap,
          aspectRatio: aspectRatio || 1,
          maxHeight: maxImageHeight || MAX_IMAGE_HEIGHT,
        }}
      >
        <img
          src={file.preview || defaultPreview}
          alt="profile"
          style={styles.picture}
        />
      </div>
      <div style={styles.bodyWrap}>
        <button type="button" name={FILE_BTN} style={styles.fileBtn} onClick={handleClick}>
          <svg
            viewBox="0 0 24 24"
            style={{
              width: 24,
              height: 24,
              color: '#efa12d',
              pointerEvents: 'none',
            }}
          >
            <path
              fill="currentColor"
              d="M5,17L9.5,11L13,15.5L15.5,12.5L19,17M20,6H12L10,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8A2,2 0 0,0 20,6Z"
            />
          </svg>
          <span style={{ pointerEvents: 'none' }}>
            {file.input ? file.input.name : 'No File Choosen'}
          </span>
        </button>
        <div style={styles.footer}>
          {file.input ? (
            <LoadingButton
              name={UPLOAD}
              label={buttonText || BUTTON_TEXT}
              loading={uploading}
              styles={styles.loadingBtn}
              onClick={handleClick}
            />
          ) : (
            <div style={styles.noFilePad}>
              <div style={styles.noFile}>
                {openDialogPrompt || OPEN_DIALOG_PROMPT}
              </div>
            </div>
          )}
        </div>
      </div>
      {onClose ? (
        <SvgButton
          type="button"
          title="Close"
          color={colors.delete}
          path={paths.close}
          style={styles.closeBtn}
          onClick={onClose}
        />
      ) : null}
    </div>
  );
};

ImageUploader.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  onValidate: PropTypes.func,
  openDialogPrompt: PropTypes.string,
  buttonText: PropTypes.string,
  previewPlaceholder: PropTypes.string,
  aspectRatio: PropTypes.number,
  maxImageHeight: PropTypes.number,
};

ImageUploader.defaultProps = {
  onClose: null,
  onValidate: null,
  openDialogPrompt: OPEN_DIALOG_PROMPT,
  buttonText: BUTTON_TEXT,
  previewPlaceholder: null,
  aspectRatio: ASPECT_RATIO,
  maxImageHeight: MAX_IMAGE_HEIGHT,
};

const ImageUploadDialog = ({
  onValidate,
  onClose,
  onSubmit,
  openDialogPrompt,
  buttonText,
  previewPlaceholder,
  aspectRatio,
  maxImageHeight,
}) => {
  const [isOpen, setOpen] = useState(false);

  useEffect(() => setOpen(true), []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setTimeout(onClose, 500);
  }, []);

  return (
    <SlideDialog isIn={isOpen}>
      <ImageUploader
        onClose={handleClose}
        onValidate={onValidate}
        onSubmit={onSubmit}
        openDialogPrompt={openDialogPrompt}
        buttonText={buttonText}
        previewPlaceholder={previewPlaceholder}
        aspectRatio={aspectRatio}
        maxImageHeight={maxImageHeight}
      />
    </SlideDialog>
  );
};

ImageUploadDialog.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onValidate: PropTypes.func,
  openDialogPrompt: PropTypes.string,
  buttonText: PropTypes.string,
  previewPlaceholder: PropTypes.string,
  aspectRatio: PropTypes.number,
  maxImageHeight: PropTypes.number,
};

ImageUploadDialog.defaultProps = {
  onValidate: null,
  openDialogPrompt: OPEN_DIALOG_PROMPT,
  buttonText: BUTTON_TEXT,
  previewPlaceholder: null,
  aspectRatio: ASPECT_RATIO,
  maxImageHeight: MAX_IMAGE_HEIGHT,
};

export const useImageUploadDialog = () => {
  const dialog = useDialog();
  const busyDialog = useBusyDialog();

  return {
    /**
     * @param {FileHandlerCallback} onSubmit
     * @param {Object} options
     * @param {FileHandlerCallback | undefined} options.onValidate
     * @param {string | undefined} options.uploadMessage
     * @param {string | undefined} options.openDialogPrompt
     * @param {string | undefined} options.buttonText
     * @param {string | undefined} options.previewPlaceholder
     */
    show: (onSubmit, {
      onValidate,
      uploadMessage,
      openDialogPrompt,
      buttonText,
      previewPlaceholder,
      aspectRatio,
      maxImageHeight,
    }) => {
      let popup;
      const handleClose = () => popup.close();

      const handleSubmit = (file, callback) => {
        const busyPopup = busyDialog.show(uploadMessage || 'Uploading Image ...');
        onSubmit(file, (error) => {
          busyPopup.close();

          if (error) {
            callback(error);
          } else {
            popup.close();
          }
        });
      };

      const conditionals = {};
      if (openDialogPrompt) {
        conditionals.openDialogPrompt = openDialogPrompt;
      }
      if (buttonText) {
        conditionals.buttonText = buttonText;
      }
      if (previewPlaceholder) {
        conditionals.previewPlaceholder = previewPlaceholder;
      }
      if (aspectRatio) {
        conditionals.aspectRatio = aspectRatio;
      }
      if (maxImageHeight) {
        conditionals.maxImageHeight = maxImageHeight;
      }

      popup = dialog.show(
        <ImageUploadDialog
          onClose={handleClose}
          onSubmit={handleSubmit}
          onValidate={onValidate}
          /* eslint-disable-next-line */
          {...conditionals}
        />,
      );
    },
  };
};

export default ImageUploader;
