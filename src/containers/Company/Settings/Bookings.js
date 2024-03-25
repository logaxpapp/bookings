import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ReceiptPercentIcon } from '@heroicons/react/20/solid';
import { Heading, Heading2 } from '../../Aside';
import { TabBody, TabHeaders } from '../../../components/TabControl';
import routes from '../../../routing/routes';
import { companyProps } from '../../../utils/propTypes';
import copy from '../../../assets/images/copy.svg';
import plus from '../../../assets/images/plus.svg';
import { SvgButton, paths } from '../../../components/svg';
import Modal from '../../../components/Modal';
import { ImageUploader } from '../../../components/ImageUploader';
import { fileSize, isImage, uploadFile } from '../../../lib/CloudinaryUtils';
import { updateCompanyImages } from '../../../redux/companySlice';
import { notification, toTimeFormat } from '../../../utils';
import { ProfilePicture } from './Brand';
import LoadingButton from '../../../components/LoadingButton';
import { ReturnPolicyComponent } from './ReturnPolicy';
import MenuSelect from '../../../components/MenuSelect';
import {
  AddressFields,
  Field,
  intVal,
  TimeAmount,
  toDisplayTimeUnit,
} from '../../CustomInputs';

const MAX_IMAGE_SIZE = 100000;
const effectiveDate = new Date(2023, 9, 23).toLocaleDateString();
const email = 'enquiries@logaxp.com';
const phoneNumber = '+1 (615) 930-6090 | +1 (832) 946-5563 | +2348031332801';

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

const languages = ['English (US)', 'English (UK)'];
const timeFormats = ['12 hrs', '24 hrs'];
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const tabs = {
  overview: 'OverView',
  preferences: 'Booking Prefences',
  policies: 'Return Policies',
  customization: 'Customization',
};

const headers = Object.values(tabs);

const Banner = ({ company, viewOnly }) => {
  const [busy, setBusy] = useState();
  const [isModalOpen, setModalOpen] = useState(false);
  const dispatch = useDispatch();

  const uploadImage = (file, callback) => {
    setBusy(true);

    uploadFile('chassnet', 'image', 'logaxp', file)
      .then(({ secure_url: url }) => (
        dispatch(updateCompanyImages(url, 'cover', 'coverImage', (err) => {
          setBusy(false);
          if (err) {
            callback(err.length < 200 ? err : 'Error uploading image. Please try again.');
          } else {
            notification.showSuccess('Image successfully upoaded!');
            callback();
          }
        }))
      ))
      .catch(() => {
        callback('An error occurred during file upload');
        setBusy(false);
      });
  };

  return (
    <div className="w-full max-w-2xl h-36 rounded-lg relative pr-6" id="company-cover-image-panel">
      {company.coverImage ? (
        <>
          <img
            src={company.coverImage}
            alt={company.name}
            className="w-full h-full rounded-lg"
          />
          <div
            className="absolute right-6 top-0 -translate-y-1/2 w-8 h-8 rounded-full bg-[#e6e8eB] flex items-center justify-center"
          >
            <SvgButton
              path={paths.pencil}
              color="#5c5c5c"
              onClick={() => setModalOpen(true)}
              sm
            />
          </div>
        </>
      ) : (
        <div className="w-full h-full flex justify-center items-center bg-[#e6e8eb]">
          <button
            type="button"
            onClick={setModalOpen(true)}
            className="py-2 px-8 bg-white rounded-3xl font-medium text-sm flex items-center gap-1 text-[#5c5c5c]"
          >
            <img aria-hidden="true" className="w-5 h-5" src={plus} alt="plus" />
            <span>Upload your banner</span>
          </button>
        </div>
      )}
      {viewOnly ? null : (
        <Modal
          isOpen={isModalOpen || busy}
          parentSelector={() => document.querySelector('#company-cover-image-panel')}
          onRequestClose={() => {
            if (!busy) {
              setModalOpen(false);
            }
          }}
          shouldCloseOnEsc
          shouldCloseOnOverlayClick
        >
          <ImageUploader
            previewPlaceholder={company.coverImage || ''}
            onValidate={validateImage}
            onSubmit={uploadImage}
          />
        </Modal>
      )}
    </div>
  );
};

Banner.propTypes = {
  company: companyProps.isRequired,
  viewOnly: PropTypes.bool,
};

Banner.defaultProps = {
  viewOnly: false,
};

const Details = ({ company }) => {
  const fields = useMemo(() => {
    const code = 1000 + company.id;
    const url = `${window.location.protocol}://${window.location.host}/${code}`;
    const currency = `${company.country.currencyCode} (${company.country.currencySymbol})`;

    return {
      code,
      currency,
      url,
    };
  }, [company]);
  const [busy, setBusy] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [about, setAbout] = useState('');

  useEffect(() => {
    setAbout(company.about || '');
  }, [company]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setAboutModalOpen(false);
    }, 5000);
  };

  return (
    <div className="w-full max-w-2xl" id="company-settings-bookings-details-panel">
      <section className="max-w-md flex flex-col gap-2">
        <span className="font-medium text-base text-[#5c5c5c]">
          Your booking page URL
        </span>
        <div className="w-full flex items-center justify-between">
          <Link
            to={routes.providerPage(fields.code)}
            className="font-medium text-base text-[#89E101]"
          >
            {fields.url}
          </Link>
          <button
            type="button"
            aria-label="copy"
            style={{ backgroundImage: `url(${copy})` }}
            className="w-5 h-5 bg-transparent cursor-pointer border-none outline-none bg-no-repeat bg-cover"
          />
        </div>
      </section>
      <section className="max-w-2xl pt-10">
        <h1 className="m-0 font-medium text-base text-[#5c5c5c]">
          Connect Apps
        </h1>
        <div className="p-2 text-xs">
          No Apps available at the moment
        </div>
      </section>
      <section className="pt-10">
        <Heading>Your Brand Details</Heading>
        <div className="pt-4">
          <Banner company={company} />
          <div className="translate-x-11 -translate-y-1/2">
            <ProfilePicture company={company} />
          </div>
        </div>
        <div className="flex flex-col gap-4 pr-6">
          <h2 className="m-0 font-bold text-xs text-[#011c39]">
            MAIN DETAILS
          </h2>
          <div className="flex flex-col gap-4 pl-4">
            <Field initialValue={company.name} name="name" title="Brand Name" />
            <Field title="Phone" initialValue={company.phoneNumber} />
            <Field title="Primary Email" initialValue={company.email} />
            <Field title="Industry" initialValue={company.category} name="category" />
            <Field title="Currency" initialValue={fields.currency} />
          </div>
        </div>
      </section>
      <AddressFields company={company} />
      <section className="pt-10 pl-6 relative flex flex-col gap-4">
        <h1 className="clip">Extras</h1>
        <Field name="slogan" title="Slogan" initialValue={company.slogan || ''} />
        <div className="bold-select-wrap">
          <div className="flex items-center gap-12">
            <span className="label">
              About
            </span>
            <SvgButton
              type="button"
              title="Edit About"
              color="#5c5c5c"
              path={paths.pencil}
              onClick={() => setAboutModalOpen(true)}
              sm
            />
          </div>
          <p className="m-0 block w-full h-40 resize-none bg-[#f8fafc] border border-[#cbd5e1] p-4">
            {company.about || ''}
          </p>
          <Modal
            isOpen={aboutModalOpen || busy}
            parentSelector={() => document.querySelector('#company-settings-bookings-details-panel')}
            onRequestClose={() => {
              if (!busy) {
                setAboutModalOpen(false);
              }
            }}
            shouldCloseOnEsc
            shouldCloseOnOverlayClick
          >
            <form onSubmit={handleSubmit} className="modal-bold-body max-h-[80vh] overflow-auto">
              <label htmlFor="about" className="bold-select-wrap">
                <span className="label">About</span>
                <textarea
                  value={about}
                  id="about"
                  placeholder="Describe your company in 200 characters or less"
                  className="text-input block w-full h-40 resize-none bg-white p-4"
                  onChange={({ target: { value } }) => {
                    if (value.length <= 200) {
                      setAbout(value);
                    }
                  }}
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
        </div>
      </section>
    </div>
  );
};

Details.propTypes = {
  company: companyProps.isRequired,
};

const BookingPolicies = () => {
  const handleChange = () => {
    // TODO:
  };

  return (
    <div className="w-[600px] flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-base text-[#8e98a8]">
            Leading Time
          </span>
          <span className="font-medium text-sm text-[#8e98a8]">
            How soon before an appointment can a customer schedule?
          </span>
        </div>
        <TimeAmount name="leadTime" onChange={handleChange} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[6px]">
          <span className="font-medium text-base text-[#8e98a8]">
            Scheduling window
          </span>
          <span className="font-medium text-sm text-[#8e98a8]">
            How far in advance can a customer schedule appointment?
          </span>
        </div>
        <TimeAmount name="leadTime" onChange={handleChange} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[6px]">
          <span className="font-medium text-base text-[#8e98a8]">
            Booking  slot size
          </span>
          <span className="font-medium text-sm text-[#8e98a8]">
            What is your average appointment duration?
          </span>
        </div>
        <TimeAmount name="leadTime" onChange={handleChange} />
      </div>
    </div>
  );
};

const ReturnPolicy = ({ company }) => {
  const [fields, setFields] = useState({
    effectiveDate,
    minNoticeTime: '48 Hours',
    refundPercent: 100,
    refundDelay: '2 Days',
    contactEmail: email,
    contactPhoneNumber: phoneNumber,
  });
  const [tab, setTab] = useState('Edit');

  useEffect(() => {
    if (company.returnPolicy) {
      setFields({
        effectiveDate: new Date(company.returnPolicy.updatedAt).toLocaleDateString(),
        minNoticeTime: toDisplayTimeUnit(company.returnPolicy.minNoticeTime),
        refundDelay: toDisplayTimeUnit(company.returnPolicy.refundDelay),
        refundPercent: company.returnPolicy.refundPercent,
        contactEmail: company.returnPolicy.contactEmail || company.email,
        contactPhoneNumber: company.returnPolicy.contactPhoneNumber || company.phoneNumber,
      });
    }
  }, [company]);

  const handleChange = (name, value) => setFields((fields) => ({ fields, [name]: value }));

  return (
    <>
      <TabHeaders tab={tab} headers={['Edit', 'Preview']} setTab={setTab} />
      <TabBody tab={tab} header="Edit">
        <div className="w-[600px] flex flex-col gap-5 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-base text-[#8e98a8]">
                Cancelation Window
              </span>
              <span className="font-medium text-sm text-[#8e98a8]">
                How soon before an appointment can a customer cancel or reschedule?
              </span>
            </div>
            <TimeAmount
              initialValue={company.returnPolicy?.minNoticeTime}
              onChange={(name, value) => handleChange('minNoticeTime', toTimeFormat(value))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-[6px]">
              <span className="font-medium text-base text-[#8e98a8]">
                Refund Processing
              </span>
              <span className="font-medium text-sm text-[#8e98a8]">
                How long does it take to process refund?
              </span>
            </div>
            <TimeAmount
              initialValue={company.returnPolicy?.refundDelay}
              onChange={(name, value) => handleChange('refundDelay', toTimeFormat(value))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-[6px]">
              <span className="font-medium text-base text-[#8e98a8]">
                Percentage Refund
              </span>
              <span className="font-medium text-sm text-[#8e98a8]">
                What percentage of the deposit do you refund customers?
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={fields.refundPercent}
                onChange={({ target: { value } }) => {
                  const val = intVal(value);

                  if (val !== null) {
                    handleChange('refundPercent', val);
                  }
                }}
                className="rounded-3xl w-20 text-center font-medium text-base text-[#5c5c5c] py-[10px] px-4"
                style={{ border: '1px solid #e9ebf8' }}
              />
              <ReceiptPercentIcon className="w-6 h-6 text-[#5c5c5c]" />
            </div>
          </div>
        </div>
      </TabBody>
      <TabBody tab={tab} header="Preview">
        <ReturnPolicyComponent
          minNoticeTime={fields.minNoticeTime}
          refundDelay={fields.refundDelay}
          refundPercent={fields.refundPercent}
          email={fields.contactEmail}
          phoneNumber={fields.contactPhoneNumber}
        />
      </TabBody>
    </>
  );
};

ReturnPolicy.propTypes = {
  company: companyProps.isRequired,
};

const Customization = () => {
  const [fields, setFields] = useState({
    preferredLanguage: languages[0],
    timeFormat: timeFormats[0],
    weekStartDay: weekdays[1],
  });

  const fieldKeys = useMemo(() => Object.keys(fields), []);

  const handleChange = (name, value) => setFields((fields) => ({ ...fields, [name]: value }));

  return (
    <div>
      <section>
        <Heading2>General</Heading2>
        <p className="m-0 text-sm text-[#5c5c5c]">
          Select standard display preference for your booking page
        </p>
        <div className="w-[600px] flex flex-col gap-5 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-base text-[#8e98a8]">
                Preferred language
              </span>
              <span className="font-medium text-sm text-[#8e98a8]">
                This will be the default language of your Booking Page
              </span>
            </div>
            <MenuSelect
              className="!rounded-3xl !text-[#5c5c5c] !font-medium !text-base"
              options={languages}
              name={fieldKeys[0]}
              value={fields.preferredLanguage}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-base text-[#8e98a8]">
                Time Format
              </span>
              <span className="font-medium text-sm text-[#8e98a8]">
                Display time in 12-hour AM/PM or 24-hour format
              </span>
            </div>
            <MenuSelect
              className="!rounded-3xl !text-[#5c5c5c] !font-medium !text-base"
              options={timeFormats}
              name={fieldKeys[1]}
              value={fields.timeFormat}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-base text-[#8e98a8]">
                Week Starts On
              </span>
              <span className="font-medium text-sm text-[#8e98a8]">
                Set the first day of the week as seen on your Booking Page.
              </span>
            </div>
            <MenuSelect
              className="!rounded-3xl !text-[#5c5c5c] !font-medium !text-base"
              options={weekdays}
              name={fieldKeys[2]}
              value={fields.weekStartDay}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const Bookings = () => {
  const [company] = useOutletContext();
  const [tab, setTab] = useState(headers[0]);

  return (
    <section className="flex flex-col gap-6 h-full overflow-y-auto overflow-x-hidden">
      <header className="flex flex-col gap-2">
        <Heading>Bookings</Heading>
        <div className="text-sm text-[#8e98a8] font-medium">
          Personalize how people schedule appointment with you
        </div>
      </header>
      <TabHeaders tab={tab} setTab={setTab} headers={headers} />
      <TabBody tab={tab} header={tabs.overview}>
        <Details company={company} />
      </TabBody>
      <TabBody tab={tab} header={tabs.preferences}>
        <BookingPolicies />
      </TabBody>
      <TabBody tab={tab} header={tabs.policies}>
        <ReturnPolicy company={company} />
      </TabBody>
      <TabBody tab={tab} header={tabs.customization}>
        <Customization company={company} />
      </TabBody>
    </section>
  );
};

export default Bookings;
