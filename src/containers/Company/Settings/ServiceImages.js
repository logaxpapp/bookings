import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import css from './styles.module.css';
import {
  createServiceImageAsync,
  deleteServiceImageAsync,
  selectServiceCategories,
} from '../../../redux/companySlice';
import {
  SvgButton,
  SvgLink,
  colors,
  paths,
} from '../../../components/svg';
import routes from '../../../routing/routes';
import AlertComponent from '../../../components/AlertComponents';
import { NewButton } from '../../../components/Buttons';
import { useImageUploadDialog } from '../../../components/ImageUploader';
import { isImage, uploadFile } from '../../../lib/CloudinaryUtils';
import { useConfirmDialog } from '../../../lib/Dialog';
import { useBusyDialog } from '../../../components/LoadingSpinner';

const MAX_IMAGES = 5;
// Careful we are using starts with to test DELETE_IMAGE
const DELETE_IMAGE = 'delete image';
const NEW = 'new';

const ServiceImages = () => {
  const [service, setService] = useState();
  const [category, setCategory] = useState();
  const [reachedLimit, setReachedLimit] = useState(false);
  const categories = useSelector(selectServiceCategories);
  const busyDialog = useBusyDialog();
  const confirmDialog = useConfirmDialog();
  const params = useParams();
  const uploadDialog = useImageUploadDialog();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setReachedLimit(service && service.images.length >= MAX_IMAGES);
  }, [service, setReachedLimit]);

  useEffect(() => {
    let id = params.service_id;
    if (!id) {
      navigate('not-found', { replace: true });
    }

    id = Number.parseInt(id, 10);

    let service;
    for (let i = 0; i < categories.length; i += 1) {
      service = categories[i].services.find((s) => s.id === id);
      if (service) {
        setCategory(categories[i]);
        setService(service);
        return;
      }
    }

    navigate('not-found', { replace: true });
  }, [categories, setService, setCategory]);

  const validateFile = useCallback((file, callback) => {
    isImage(file)
      .then((isImage) => callback(isImage ? undefined : 'File type NOT supported!'))
      .catch(() => callback('File type NOT supported!'));
  }, []);

  const handleSubmit = useCallback((file, callback) => {
    uploadFile('chassnet', 'image', 'logaxp', file)
      .then(({ secure_url: url }) => (
        dispatch(createServiceImageAsync({ url }, service, category, (err) => {
          if (err) {
            callback(err.length < 200 ? err : 'Error uploading image. Please try again.');
          } else {
            callback();
          }
        }))
      ))
      .catch(() => {
        callback('An error occurred during file upload');
      });
  }, [service, category]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === NEW) {
      uploadDialog.show(handleSubmit, { onValidate: validateFile });
    } else if (name.startsWith(DELETE_IMAGE)) {
      const id = Number.parseInt(name.substring(DELETE_IMAGE.length), 10);
      const image = service.images.find((img) => img.id === id);
      if (image) {
        confirmDialog.show(
          'The selected will be permanently deleted!',
          'Do you wish to continue?',
          (confirmed) => {
            if (confirmed) {
              const popup = busyDialog.show('Deleting Image ...');
              dispatch(deleteServiceImageAsync(image.id, service, category, popup.close));
            }
          },
        );
      }
    }
  }, [handleSubmit]);

  if (!service) {
    return <></>;
  }

  return (
    <section className={`${css.content} ${css.overflow_hidden}`}>
      <header className={`${css.page_header} ${css.images_header}`}>
        <div className={css.page_heading_wrap}>
          <SvgLink
            to={routes.company.absolute.settings.services}
            title="Back To Services"
            path={paths.back}
          />
          <h1 className={css.h1}>{`${service.name} - Images`}</h1>
        </div>
        {!reachedLimit ? (
          <NewButton name={NEW} text="New Service" onClick={handleClick} />
        ) : null}
      </header>
      {reachedLimit ? (
        <AlertComponent type="error" style={{ margin: 0, padding: 8 }}>
          <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>
            {`You have reached the maximum allowed images for a single service (${MAX_IMAGES}).`}
          </span>
        </AlertComponent>
      ) : null}
      <>
        {service.images.length ? (
          <div className={css.image_card_list_wrap}>
            <div className={css.image_card_list}>
              {service.images.map(({ id, url }) => (
                <div key={id} className={css.image_card_wrap}>
                  <img className={css.image_card} src={url} alt={service.name} />
                  <div className={`dimmed ${css.image_delete_wrap}`}>
                    <SvgButton
                      type="button"
                      name={`${DELETE_IMAGE}${id}`}
                      title="Delete"
                      color={colors.delete}
                      path={paths.delete}
                      onClick={handleClick}
                      style={{ position: 'relative' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`${css.empty_notice} ${css.center} ${css.pad_top}`}>
            No Image found!
          </div>
        )}
      </>
    </section>
  );
};

export default ServiceImages;
