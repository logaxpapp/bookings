import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Menu, Transition } from '@headlessui/react';
import {
  ChevronDownIcon,
  DocumentDuplicateIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Aside, { Heading } from '../../Aside';
import { createServiceImageAsync, deleteServiceImageAsync, selectServiceCategories } from '../../../redux/companySlice';
import routes from '../../../routing/routes';
import EmptyListPanel from '../../../components/EmptyListPanel';
import { classNames, notification } from '../../../utils';
import { companyProps, serviceProps } from '../../../utils/propTypes';
import { SvgButton, paths } from '../../../components/svg';
import Modal from '../../../components/Modal';
import { fileSize, isImage, uploadFile } from '../../../lib/CloudinaryUtils';
import { ImageUploader } from '../../../components/ImageUploader';
import { ShareButtonDesign } from '../../../components/Buttons';
import { useHover } from '../../../lib/hooks';
import { Ring } from '../../../components/LoadingButton';
import { CategoryEditor, ServiceEditor } from './Editor';
import { selectIsServiceEditorOpen, setServiceEditorOpen } from '../../../redux/controls';

const CATEGORY = 'category';
const DASHBOARD_CONTAINER_ID = 'service-dashboard';
const MAX_IMAGES = 2;
const MAX_IMAGE_SIZE = 100000;
const SERVICE = 'service';

const tooltipStyles = {
  visible: {
    opacity: 1,
    visibility: 'visible',
  },
  hidden: {
    opacity: 0,
    visibility: 'hidden',
  },
};

/**
 * @param {import('../../../types/').Category[]} categories
 * @returns {import('../../../types/').Service[]}
 */
const allServices = (categories) => categories.reduce(
  (memo, current) => [...memo, ...current.services],
  [],
);

const getColors = (() => {
  const colors = [
    { main: '#89e101', faint: 'f0feda' },
    { main: '#673fd7', faint: 'dadafe' },
    { main: '#011c39', faint: 'e6e8eb' },
  ];
  const { length } = colors;
  let index = 0;

  return () => {
    const color = colors[index];
    index += 1;
    if (index === length) {
      index = 0;
    }

    return color;
  };
})();

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

/**
 * @param {Object} props
 * @param {import('../../../types').Service} props.service
 */
const ImagesPanel = ({ serviceId }) => {
  const [params, setParams] = useState({
    service: null,
    category: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState(null);
  const [isImageUploadModalOpen, setImageUploadModalOpen] = useState(false);
  const categories = useSelector(selectServiceCategories);
  const dispatch = useDispatch();

  useEffect(() => {
    const params = { service: null, category: null };
    if (serviceId && categories) {
      for (let i = 0; i < categories.length; i += 1) {
        const service = categories[i].services.find(({ id }) => id === serviceId);

        if (service) {
          params.service = service;
          params.category = categories[i];
          break;
        }
      }
    }

    setParams(params);
  }, [serviceId, categories]);

  if (!params.service) {
    return null;
  }

  const uploadImage = (file, callback) => {
    setUploading(true);

    uploadFile('chassnet', 'image', 'logaxp', file)
      .then(({ secure_url: url }) => (
        dispatch(createServiceImageAsync({ url }, params.service, params.category, (err) => {
          setUploading(false);
          if (err) {
            callback(err.length < 200 ? err : 'Error uploading image. Please try again.');
          } else {
            notification.showSuccess('Image successfully upoaded!');
            callback();
            setImageUploadModalOpen(false);
          }
        }))
      ))
      .catch(() => {
        callback('An error occurred during file upload');
        setUploading(false);
      });
  };

  const deleteImage = () => {
    const image = params.service.images.find(({ url }) => url === modalImageSrc);

    if (image) {
      setDeleting(true);
      dispatch(deleteServiceImageAsync(image.id, params.service, params.category, (err) => {
        setDeleting(false);
        if (!err) {
          notification.showSuccess('Image successfully deleted');
          setModalImageSrc(null);
        }
      }));
    }
  };

  return (
    <div className="flex gap-1 pt-1">
      {params.service.images && params.service.images.length ? (
        params.service.images.map(({ id, url }) => (
          <button
            key={id}
            type="button"
            className="cursor-pointer bg-transparent w-6 h-6 p-0 border-0 outline-none"
            onClick={() => setModalImageSrc(url)}
          >
            <img src={url} alt="!" className="w-full h-full rounded" />
          </button>
        ))
      ) : (
        <span className="">
          No Images Added
        </span>
      )}
      {params.service.images && params.service.images.length < MAX_IMAGES ? (
        <SvgButton
          type="button"
          path={paths.plus}
          onClick={() => setImageUploadModalOpen(true)}
          style={{
            border: '1px solid #ddd',
            borderRadius: 4,
          }}
        />
      ) : null}
      <Modal
        isOpen={!!modalImageSrc || deleting}
        parentSelector={() => document.querySelector('#service-dashboard')}
        onRequestClose={() => {
          if (!deleting) {
            setModalImageSrc(null);
          }
        }}
        style={{ content: { maxWidth: 'max-content' } }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <div className="p-8">
          <img src={modalImageSrc} alt={params.service.name} className="w-80" />
          <div className="flex justify-end items-center gap-4 py-2">
            {deleting ? (
              <Ring color="blue" size={20} />
            ) : null}
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex gap-4 items-center">
                  <EllipsisVerticalIcon className="w-6 h-6" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  className="absolute right-0 z-10 mt-2 w-min origin-top-right
                  rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <div className="py-1">
                    <Menu.Item disabled={deleting}>
                      {({ active }) => (
                        <button
                          type="button"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'flex gap-2 items-center py-[10px] pl-10 pr-20',
                          )}
                          onClick={deleteImage}
                        >
                          <TrashIcon className="w-4 h-4" stroke="red" />
                          <span className="text-sm font-[#545454] whitespace-nowrap">
                            Delete Image
                          </span>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isImageUploadModalOpen || uploading}
        parentSelector={() => document.querySelector('#service-dashboard')}
        onRequestClose={() => setImageUploadModalOpen(false)}
        style={{ content: { maxWidth: 'max-content' } }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <div className="p-8">
          <ImageUploader
            onSubmit={uploadImage}
            onValidate={validateImage}
          />
        </div>
      </Modal>
    </div>
  );
};

ImagesPanel.propTypes = {
  serviceId: PropTypes.number.isRequired,
};

/**
 * @param {Object} props
 * @param {import('../../../types').Service} props.service
 */
const ServiceImage = ({ service, color, duration }) => {
  if (service.images && service.images.length) {
    return (
      <img
        src={service.images[0].url}
        alt={duration}
        className="rounded-full w-12 h-12"
      />
    );
  }

  return (
    <div className={`rounded-full w-12 h-13 flex justify-center items-center bg-[${color}]`}>
      <span className="text-[#011c39]">
        {duration}
      </span>
    </div>
  );
};

ServiceImage.propTypes = {
  service: serviceProps.isRequired,
  duration: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

/**
 * @param {Object} props
 * @param {import('../../../types').Service} props.service
 * @param {import('../../../types').Category[]} props.categories
 */
const ServicePanel = ({ service, currencySymbol }) => {
  const [editor, setEditor] = useState({ busy: false, isOpen: false });
  const colors = useMemo(() => getColors(), []);
  const { duration, price, deposit } = useMemo(() => ({
    duration: service.duration / 60,
    price: `${currencySymbol}${service.price / 100}`,
    deposit: service.minDeposit ? `${currencySymbol}${service.minDeposit / 100}` : '---',
  }), [service]);

  return (
    <div
      key={service.id}
      className="rounded-lg px-6 py-3 border border-[#e9ebf8] border-l-8 flex justify-between items-end"
      style={{ borderLeftColor: colors.main }}
    >
      <div className="flex gap-4">
        <ServiceImage service={service} color={colors.faint} duration={duration} />
        <div className="flex flex-col gap-1 text-[#5c5c5c]">
          <span>{service.name}</span>
          <div className="flex items-center gap-2">
            <span>{`${duration}Mins`}</span>
            <span>{price}</span>
            <span>{deposit}</span>
          </div>
          <ImagesPanel serviceId={service.id} />
        </div>
      </div>
      <div>
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex gap-4 items-center">
              <ShareButtonDesign />
              <EllipsisVerticalIcon className="w-4 h-4" />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className="absolute right-0 z-10 mt-2 w-min origin-top-right
              rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'flex gap-2 items-center py-[10px] pl-10 pr-20',
                      )}
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" stroke="#545454" type="outline" />
                      <span className="text-sm font-[#545454] whitespace-nowrap">
                        Copy booking link
                      </span>
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'flex gap-2 items-center py-[10px] pl-10 pr-20 w-full',
                      )}
                    >
                      <EnvelopeIcon className="w-4 h-4" color="#545454" />
                      <span className="text-sm font-[#545454] whitespace-nowrap">
                        Share via email
                      </span>
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      <Modal
        isOpen={editor.isOpen || editor.busy}
        parentSelector={() => document.querySelector('#service-container-id')}
        onRequestClose={() => {
          if (!editor.busy) {
            setEditor({ busy: false, isOpen: false });
          }
        }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <ServiceEditor
          onClose={() => setEditor({ busy: false, isOpen: false })}
          setBusy={() => setEditor({ busy: true, isOpen: false })}
          service={service}
        />
      </Modal>
    </div>
  );
};

ServicePanel.propTypes = {
  service: serviceProps.isRequired,
  currencySymbol: PropTypes.string.isRequired,
};

export const ServiceComponent = ({ company }) => {
  const [busy, setBusy] = useState(false);
  const categories = useSelector(selectServiceCategories);
  const isEditorOpen = useSelector(selectIsServiceEditorOpen);
  const [state, setState] = useState({
    categoryName: 'All Services',
    services: allServices(categories),
  });
  const dispatch = useDispatch();

  return (
    <div id={DASHBOARD_CONTAINER_ID}>
      <div>
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex w-full justify-center gap-4 rounded-md bg-transparent px-3 py-2 text-sm font-semibold text-gray-900">
              <span>
                {`${state.categoryName}(${state.services.length})`}
              </span>
              <ChevronDownIcon className="-mr-1 h-5 w-5 text-[#454545]" aria-hidden="true" />
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className="absolute left-0 z-10 mt-2 w-56 origin-top-right
              rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block w-full px-4 py-2 text-left text-sm',
                      )}
                      onClick={() => {
                        if (state.categoryName !== 'All Services') {
                          setState({ categoryName: 'All Services', services: allServices(categories) });
                        }
                      }}
                    >
                      All Services
                    </button>
                  )}
                </Menu.Item>
                {categories.map((cat) => (
                  <Menu.Item key={cat.id}>
                    {({ active }) => (
                      <button
                        type="button"
                        className={classNames(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block w-full px-4 py-2 text-left text-sm',
                        )}
                        onClick={() => {
                          if (state.categoryName !== cat.name) {
                            setState({ categoryName: cat.name, services: cat.services });
                          }
                        }}
                      >
                        {cat.name}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      <div className="flex-1 w-full">
        {state.services.length ? (
          <div className="flex flex-col gap-4 py-10">
            {state.services.map((service) => (
              <ServicePanel
                key={service.id}
                service={service}
                currencySymbol={company.country.currencySymbol}
              />
            ))}
          </div>
        ) : (
          <EmptyListPanel />
        )}
      </div>
      <Modal
        isOpen={isEditorOpen || busy}
        parentSelector={() => document.querySelector(`#${DASHBOARD_CONTAINER_ID}`)}
        onRequestClose={() => {
          if (!busy) {
            dispatch(setServiceEditorOpen(false));
          }
        }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <ServiceEditor
          busy={busy}
          onClose={() => dispatch(setServiceEditorOpen(false))}
          setBusy={setBusy}
        />
      </Modal>
    </div>
  );
};

ServiceComponent.propTypes = {
  company: companyProps.isRequired,
};

export const ServicesDashboard = () => {
  const [company] = useOutletContext();

  return (
    <div className="flex flex-col overflow-hidden w-full h-full p-8 relative">
      <ServiceComponent company={company} />
    </div>
  );
};

const Services = () => {
  /**
   * @type {import('../../../types/').Category[]}
   */
  const categories = useSelector(selectServiceCategories);
  const servicesCount = useMemo(() => {
    if (!categories) {
      return 0;
    }

    return categories.reduce((memo, current) => memo + current.services.length, 0);
  }, [categories]);
  const [company] = useOutletContext();
  const categoryLinkRef = useRef(null);
  const categoryHovered = useHover(categoryLinkRef);
  const [modals, setModals] = useState({
    category: { busy: false, isOpen: false },
    service: { busy: false, isOpen: false },
  });
  const dispatch = useDispatch();

  const handleClick = ({ target: { name } }) => {
    if (name === CATEGORY) {
      setModals({
        category: { busy: false, isOpen: true },
        service: { busy: false, isOpen: false },
      });
    } else if (name === SERVICE) {
      dispatch(setServiceEditorOpen(true));
    }
  };

  return (
    <div className="flex-1 h-full flex" id="service-container-id">
      <Aside>
        <Heading>Services & Categories</Heading>
        <div className="flex flex-col py-5 gap-4">
          <div className="flex flex-col gap-3">
            <Link
              to={routes.company.absolute.services.home}
              className="w-52 h-10 flex items-center bg-[#f6f8fb] border-[#89e101] rounded border-l-[3px] pl-3 text-sm font-semibold"
            >
              <span>{`Services(${servicesCount})`}</span>
            </Link>
            <div className="flex justify-center w-52">
              <button
                type="button"
                name={SERVICE}
                className="flex items-center gap-[2.5px] bg-transparent border-o outline-none cursor-pointer"
                onClick={handleClick}
              >
                <svg
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="pointer-events-none"
                >
                  <path d="M8 3.16666V13.8333" stroke="#454545" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2.66797 8.5H13.3346" stroke="#454545" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-normal text-sm text-[#454545] pointer-events-none">
                  New Service
                </span>
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3 relative">
            <Link
              ref={categoryLinkRef}
              to={routes.company.absolute.services.categories}
              className="w-52 h-10 flex items-center bg-[#f6f8fb] border-[#455eb5] rounded border-l-[3px] pl-3 text-sm font-semibold"
              data-tooltip-target="category-explanation"
            >
              <span>{`Categories(${categories.length})`}</span>
            </Link>
            <div
              id="category-explanation"
              role="tooltip"
              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 -translate-x-3 w-full top-[48px]"
              style={categoryHovered ? tooltipStyles.visible : tooltipStyles.hidden}
            >
              <span>
                Organize your services into categories to manage them easily.
                Each service must be assigned to a category.
                If a service cannot be classified further,
                simply assign it to a category with the same name.
                Remember, users can find a service by searching for its name or its category.
              </span>
              <div
                aria-hidden="true"
                className="tooltip-arrow absolute -top-[6px] left-6 bg-gray-900 w-3 h-3 rotate-45"
                data-popper-arrow
              />
            </div>
            <div className="flex justify-center w-52">
              <button
                type="button"
                name={CATEGORY}
                className="flex items-center gap-[2.5px] bg-transparent border-o outline-none cursor-pointer"
                onClick={handleClick}
              >
                <svg
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="pointer-events-none"
                >
                  <path d="M8 3.16666V13.8333" stroke="#454545" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2.66797 8.5H13.3346" stroke="#454545" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-normal text-sm text-[#454545] pointer-events-none">
                  New Category
                </span>
              </button>
            </div>
          </div>
        </div>
      </Aside>
      <main className="flex-1 h-full bg-[#fafafa] px-7 py-10">
        <div className="bg-white w-full h-full rounded-lg">
          <Outlet context={[company]} />
        </div>
      </main>
      <Modal
        isOpen={modals.category.isOpen || modals.category.busy}
        parentSelector={() => document.querySelector('#service-container-id')}
        onRequestClose={() => {
          if (!modals.category.busy) {
            setModals({ ...modals, category: { busy: false, isOpen: false } });
          }
        }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <CategoryEditor
          onClose={() => setModals({ ...modals, category: { busy: false, isOpen: false } })}
          setBusy={(busy) => (
            setModals((modals) => ({ ...modals, category: { isOpen: true, busy } }))
          )}
        />
      </Modal>
    </div>
  );
};

export default Services;
