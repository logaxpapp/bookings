import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router';
import PropTypes from 'prop-types';
import { SvgButton, paths } from '../../../components/svg';
import { childrenProps, companyProps } from '../../../utils/propTypes';
import css from './styles.module.css';
import config from '../../../config';
import routes from '../../../routing/routes';
import Modal from '../../../components/Modal';
import AddressEditor from '../../AddressEditor';
import { loadCountriesAsync, selectCountries } from '../../../redux/countriesSlice';
import LoadingButton from '../../../components/LoadingButton';
import { updateCompanyAsync, updateCompanyImages } from '../../../redux/companySlice';
import { ImageUploader } from '../../../components/ImageUploader';
import { fileSize, isImage, uploadFile } from '../../../lib/CloudinaryUtils';
import { notification } from '../../../utils';

const BRAND_HEADER = 'brand_neader';
const ID = 'company-brand';
const FIELD = 'field';
const MAX_IMAGE_SIZE = 100000;

const validateImage = (file, callback) => {
  if (file.size > MAX_IMAGE_SIZE) {
    callback(
      `The selected image size [${fileSize(file.size)}] is greater than the maximum allowed size [${fileSize(MAX_IMAGE_SIZE)}]`,
    );
    return;
  }

  isImage(file)
    .then((isImage) => callback(isImage ? undefined : 'File type NOT supported!'))
    .catch(() => callback('File type NOT supported!'));
};

const FieldRow = ({
  text,
  onEdit,
  className,
  children,
}) => (
  <div>
    <div className={`flex items-center gap-4 ${css.field} ${className}`}>
      <span className="text-[#011c39]">{text}</span>
      {onEdit ? (
        <SvgButton
          path={paths.pencil}
          color="011c39"
          onClick={onEdit}
          style={{
            marginLeft: 24,
          }}
          sm
        />
      ) : null}
    </div>
    {children}
  </div>
);

FieldRow.propTypes = {
  children: childrenProps,
  className: PropTypes.string,
  onEdit: PropTypes.func,
  text: PropTypes.string,
};

FieldRow.defaultProps = {
  className: '',
  children: null,
  onEdit: null,
  text: '',
};

export const FieldModal = ({
  currentValue,
  heading,
  label,
  busy,
  isOpen,
  onSubmit,
  onClose,
}) => {
  const [value, setValue] = useState(currentValue || '');

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(value);
  };

  return (
    <Modal
      isOpen={busy || isOpen}
      onRequestClose={() => {
        if (!busy) {
          onClose();
        }
      }}
      parentSelector={() => document.querySelector('#company-panel')}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
    >
      <form
        onSubmit={handleSubmit}
        className="modal-bold-body max-h-[80vh] overflow-auto"
      >
        {heading ? (
          <h1 className="m-0 text-lg font-semibold">
            {heading}
          </h1>
        ) : null}
        <label htmlFor={FIELD} className="bold-select-wrap">
          {label ? <span className="label">{label}</span> : null}
          <input
            type="text"
            name={FIELD}
            id={FIELD}
            value={value}
            onChange={({ target: { value } }) => setValue(value)}
            className="text-input"
          />
        </label>
        <LoadingButton
          type="submit"
          loading={busy}
          label="Submit"
          styles={{ marginTop: 0 }}
        />
      </form>
    </Modal>
  );
};

FieldModal.propTypes = {
  currentValue: PropTypes.string,
  heading: PropTypes.string,
  label: PropTypes.string,
  busy: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

FieldModal.defaultProps = {
  currentValue: '',
  heading: '',
  label: 'Please Enter Text',
  busy: false,
  isOpen: false,
};

export const BrandHeader = ({ company }) => {
  const [state, setState] = useState({
    isPictureModalOpen: false,
    isPictureModalBusy: false,
    isSloganModalOpen: false,
    isSloganModalBusy: false,
  });
  const initials = useMemo(() => {
    const parts = company.name.split('');

    return `${parts[0][0]} ${parts.length > 1 ? parts[1][0] : parts[0][1]}`.toUpperCase();
  }, [company]);
  const dispatch = useDispatch();

  const updateSlogan = (value) => {
    setState((state) => ({ ...state, isSloganModalBusy: true }));
    dispatch(updateCompanyAsync({ slogan: value }, (err) => {
      if (!err) {
        setState((state) => ({ ...state, isSloganModalBusy: false, isSloganModalOpen: false }));
      }
    }));
  };

  const uploadImage = (file, callback) => {
    setState((state) => ({ ...state, isPictureModalBusy: true }));

    uploadFile('chassnet', 'image', 'logaxp', file)
      .then(({ secure_url: url }) => (
        dispatch(updateCompanyImages(url, 'profile', 'profilePicture', (err) => {
          setState((state) => ({ ...state, isPictureModalBusy: false }));
          if (err) {
            callback(err.length < 200 ? err : 'Error uploading image. Please try again.');
          } else {
            notification.showSuccess('Image successfully upoaded!');
            callback();
            setState((state) => ({ ...state, isPictureModalOpen: false }));
          }
        }))
      ))
      .catch(() => {
        callback('An error occurred during file upload');
        setState((state) => ({ ...state, isPictureModalBusy: false }));
      });
  };

  return (
    <div className="flex items-center gap-6" id={BRAND_HEADER}>
      <div className="relative min-w-fit">
        <div className="w-[84px] h-[84px] flex justify-center items-center bg-[#5c5c5c] overflow-hidden rounded-full relative">
          {company.profilePicture ? (
            <img alt={initials} src={company.profilePicture} className="w-full h-full rounded-full flex-1" />
          ) : (
            <span className="font-semibold text-base text-white">
              {initials}
            </span>
          )}
        </div>
        <div className="absolute w-7 h-7 rounded-full flex justify-center items-center -right-1 -top-1 bg-[#e6e8eB]">
          <SvgButton
            type="button"
            path={paths.pencil}
            title="Edit"
            onClick={() => setState((state) => ({ ...state, isPictureModalOpen: true }))}
            sm
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-base text-[#011c39] m-0">
          {company.name}
        </h1>
        <FieldRow
          text={company.slogan || 'No slogan'}
          className={css.slogan}
          onEdit={() => setState((state) => ({ ...state, isSloganModalOpen: true }))}
        >
          <FieldModal
            currentValue={company.slogan || ''}
            heading="Update Slogan"
            label="Enter Slogan"
            busy={state.isSloganModalBusy}
            isOpen={state.isSloganModalOpen}
            onSubmit={updateSlogan}
            onClose={() => setState((state) => ({ ...state, isSloganModalOpen: false }))}
          />
        </FieldRow>
      </div>
      <Modal
        isOpen={state.isPictureModalOpen || state.isPictureModalBusy}
        parentSelector={() => document.querySelector(`#${BRAND_HEADER}`)}
        onRequestClose={() => setState((state) => ({ ...state, isPictureModalOpen: false }))}
        style={{ content: { maxWidth: 'max-content' } }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <div className="p-8">
          <ImageUploader
            onSubmit={uploadImage}
            onValidate={validateImage}
            previewPlaceholder={company.profilePicture || ''}
          />
        </div>
      </Modal>
    </div>
  );
};

BrandHeader.propTypes = {
  company: companyProps.isRequired,
};

export const BrandDetails = ({ company }) => {
  const storeCountries = useSelector(selectCountries);
  const [isAddressModalOpen, setAddressModalOpen] = useState(false);
  const [isPostingAddress, setPostingAddress] = useState(false);
  const fields = useMemo(() => {
    const parts = company.name.split('');

    const initial = `${parts[0][0]} ${parts.length > 1 ? parts[1][0] : parts[0][1]}`.toUpperCase();

    return {
      address: company.address
        ? `${company.address.line1} ${company.address.line2} ${company.address.city} ${company.address.state} ${company.address.country}`
        : 'Address NOT set!',
      currency: `${company.country.name} ${company.country.code} (${company.country.currencySymbol})`,
      initial,
      url: `${config.API_HOST}${routes.providerPage(`A${company.id + 1000}`)}`,
    };
  }, [company]);
  const countries = useMemo(() => {
    const result = [];
    const country = storeCountries?.find(({ id }) => id === company.country.id);

    if (country) {
      result.push(country);
    }

    return result;
  }, [company, storeCountries]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!storeCountries) {
      dispatch(loadCountriesAsync());
    }
  }, [storeCountries]);

  const handleChangeAddress = () => {
    setPostingAddress(true);
    setTimeout(() => setPostingAddress(false), 10000);
  };

  return (
    <div className="flex flex-col gap-4" id="company-brand-details">
      <FieldRow className={css.phone} text={company.phoneNumber} />
      <FieldRow className={css.email} text={company.email} />
      <FieldRow className={css.url} text={fields.url} />
      <FieldRow className={css.currency} text={fields.currency} />
      <FieldRow
        className={css.location}
        text={fields.address}
        onEdit={() => setAddressModalOpen(true)}
      >
        <Modal
          isOpen={isAddressModalOpen || isPostingAddress}
          parentSelector={() => document.querySelector('#company-brand-details')}
          onRequestClose={() => {
            if (!isPostingAddress) {
              setAddressModalOpen(false);
            }
          }}
          shouldCloseOnEsc
          shouldCloseOnOverlayClick
        >
          <AddressEditor
            countries={countries}
            busy={isPostingAddress}
            onSubmit={handleChangeAddress}
          />
        </Modal>
      </FieldRow>
    </div>
  );
};

BrandDetails.propTypes = {
  company: companyProps.isRequired,
};

const Brand = () => {
  const [company] = useOutletContext();

  return (
    <div id={ID} className="flex flex-col gap-10">
      <BrandHeader company={company} />
      <BrandDetails company={company} />
    </div>
  );
};

export default Brand;
