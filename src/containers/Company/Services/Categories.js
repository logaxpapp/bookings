import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import GridPanel from '../../../components/GridPanel';
import { Heading1 } from '../../Aside';
import { deleteServiceCategoryAsync, selectServiceCategories } from '../../../redux/companySlice';
import { SvgButton, colors, paths } from '../../../components/svg';
import Modal from '../../../components/Modal';
import { serviceCategoryProps } from '../../../utils/propTypes';
import { CategoryEditor } from './Editor';

const DELETE = 'delete';
const EDIT = 'edit';

const CategoryCard = ({ category, onDelete, onEdit }) => {
  const serviceCount = useMemo(() => {
    const count = category.services.length;

    return `${count} service${count === 1 ? '' : 's'}`;
  });

  const handleClick = ({ target: { name } }) => {
    if (name === DELETE) {
      onDelete(category);
    } else if (name === EDIT) {
      onEdit(category);
    }
  };

  return (
    <div className="p-3 w-full flex justify-center items-center">
      <section className="py-3 rounded border border-slate-200 w-full sm:min-w-48">
        <h1 className="pb-2 pl-6 font-medium text-lg text-[#5c5c5c]">
          {category.name}
        </h1>
        <p className="pb-2 pl-8 font-normal text-sm text-[#5c5c5c]">
          {serviceCount}
        </p>
        <div className="flex justify-end gap-5 pt-2 pr-3 border-t border-slate-100">
          <SvgButton
            type="button"
            name={EDIT}
            color="#5c5c5c"
            title="Edit"
            path={paths.pencilOutline}
            onClick={handleClick}
            sm
          />
          <SvgButton
            type="button"
            name={DELETE}
            color={colors.delete}
            title="Delete"
            path={paths.delete}
            onClick={handleClick}
            sm
          />
        </div>
      </section>
    </div>
  );
};

CategoryCard.propTypes = {
  category: serviceCategoryProps.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

const Categories = () => {
  const categories = useSelector(selectServiceCategories);
  const [deleteModal, setDeleteModal] = useState({
    category: null,
    busy: false,
  });
  const [editModal, setEditModal] = useState({
    category: null,
    busy: false,
  });
  const dispatch = useDispatch();

  const handleRequestDelete = (category) => setDeleteModal({ category, busy: false });

  const handleRequestEdit = (category) => setEditModal({ category, busy: false });

  const handleDelete = () => {
    if (deleteModal.category) {
      setDeleteModal((modal) => ({ ...modal, busy: true }));
      dispatch(deleteServiceCategoryAsync(deleteModal.category.id, (err) => {
        setDeleteModal(({ category }) => ({
          category: err ? category : null,
          busy: false,
        }));
      }));
    }
  };

  return (
    <section className="flex-1 overflow-auto py-2 sm:py-5 px-3 sm:px-8 h-full" id="company-service-categories-panel">
      <Heading1>Categories</Heading1>
      <div className="pt-4">
        {!categories.length ? (
          <div className="font-bold text-xl text-[#858b9c] p-12 text-center">
            No Service Categories Found!
          </div>
        ) : (
          <GridPanel minimumChildWidth={200}>
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onDelete={handleRequestDelete}
                onEdit={handleRequestEdit}
              />
            ))}
          </GridPanel>
        )}
      </div>
      <Modal
        isOpen={deleteModal.category || deleteModal.busy}
        parentSelector={() => document.querySelector('#company-service-categories-panel')}
        onRequestClose={() => {
          if (!deleteModal.busy) {
            setDeleteModal({ category: null, busy: false });
          }
        }}
        style={{ content: { maxWidth: 400 } }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        {deleteModal.category ? (
          <div className="py-5 px-8">
            <p className="m-0 px-4 flex flex-col gap-3">
              <span className="font-medium text-lg">
                {`The category ${deleteModal.category.name} and all it's services will be permanently deleted!`}
              </span>
              <span className="text-lg font-semibold text-center">
                Do yo wish to continue?
              </span>
            </p>
            <div className="pt-6 px-4 flex items-center justify-end">
              <button
                type="button"
                className={`btn danger ${deleteModal.busy ? 'busy' : ''}`}
                onClick={handleDelete}
              >
                Confirm
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
      <Modal
        isOpen={editModal.category || editModal.busy}
        parentSelector={() => document.querySelector('#company-service-categories-panel')}
        onRequestClose={() => {
          if (!editModal.busy) {
            setEditModal({ category: null, busy: false });
          }
        }}
        style={{ content: { maxWidth: 480 } }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <CategoryEditor
          category={editModal?.category}
          onClose={() => setEditModal({ category: null, busy: false })}
          setBusy={(busy) => (
            setEditModal((modals) => ({ ...modals, busy }))
          )}
        />
      </Modal>
    </section>
  );
};

export default Categories;
