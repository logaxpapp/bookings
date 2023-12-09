import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import css from './styles.module.css';
import { SvgButton, colors, paths } from '../../../components/svg';
import { NewButton } from '../../../components/Buttons';
import { useConfirmDialog, useTextInputDialog } from '../../../lib/Dialog';
import {
  createServiceCategoryAsync,
  deleteServiceCategoryAsync,
  selectServiceCategories,
  updateServiceCategoryAsync,
} from '../../../redux/companySlice';
import { useBusyDialog } from '../../../components/LoadingSpinner';
import PageHeader from '../../PageHeader';
import { notification } from '../../../utils';

const NEW = 'new';

const ServiceCategories = () => {
  const categories = useSelector(selectServiceCategories);
  const dispatch = useDispatch();
  const inputDialog = useTextInputDialog();
  const busyDialog = useBusyDialog();
  const confirmDialog = useConfirmDialog();

  const handleNew = useCallback(() => {
    inputDialog.show('Enter New Name', (name) => {
      const category = categories.find((cat) => cat.name === name);
      if (category) {
        notification.showError(`Service Category with name ${name} already exists!`);
        return;
      }

      const popup = busyDialog.show('Creating Category ...');
      dispatch(createServiceCategoryAsync(name, popup.close));
    });
  }, [categories]);

  const handleEdit = useCallback(({ target: { name } }) => {
    const category = categories.find((cat) => cat.id === Number.parseInt(name, 10));
    if (category) {
      inputDialog.show('Enter New Name', (newName) => {
        if (newName !== category.name) {
          if (categories.find((cat) => cat.name === newName)) {
            notification.showError(`Service Category with name ${newName} already exists!`);
            return;
          }
          const popup = busyDialog.show('Updating Category ...');
          dispatch(updateServiceCategoryAsync(category.id, newName, popup.close));
        }
      }, category.name);
    }
  }, [categories]);

  const handleDelete = useCallback(({ target: { name } }) => {
    const category = categories.find((cat) => cat.id === Number.parseInt(name, 10));
    if (category) {
      confirmDialog.show(
        `The Category '${category.name}' with all it's servives and their time slots will be deleted. Note however that this will NOT affect already booked appointments.`,
        'Do you wish to continue?',
        (confirmed) => {
          if (!confirmed) {
            return;
          }

          const popup = busyDialog.show('Deleting Service Categories');
          dispatch(deleteServiceCategoryAsync(category.id, popup.close));
        },
      );
    }
  }, [categories]);

  return (
    <section className={`${css.content} ${css.overflow_hidden}`}>
      <PageHeader title="Service Categories">
        <NewButton name={NEW} text="New Category" onClick={handleNew} />
      </PageHeader>
      <div className="table-wrap">
        {categories.length ? (
          <div className="table-card">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th rowSpan={2}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.name}</td>
                    <td className="control">
                      <SvgButton
                        type="button"
                        name={cat.id}
                        path={paths.pencil}
                        title="Edit"
                        onClick={handleEdit}
                        sm
                      />
                    </td>
                    <td className="control">
                      <SvgButton
                        type="button"
                        name={cat.id}
                        path={paths.delete}
                        title="Delete"
                        color={colors.delete}
                        onClick={handleDelete}
                        sm
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={css.empty_notice}>
            No categories found.
          </div>
        )}
      </div>
    </section>
  );
};

export default ServiceCategories;
