import { useDialog } from '../lib/Dialog';
import { SvgButton, colors, paths } from './svg';

export const useBoldDialog = () => {
  const dialog = useDialog();

  return {
    show: (children, closable = true) => {
      let popup;
      const handleClose = () => popup.close();
      popup = dialog.show(
        <div className="dialog">
          <div className="bold-dialog-body">
            {children}
            {closable ? (
              <SvgButton
                type="button"
                color={colors.delete}
                path={paths.close}
                title="Close"
                onClick={handleClose}
                style={{
                  position: 'absolute',
                  right: 4,
                  top: 4,
                }}
              />
            ) : null}
          </div>
        </div>,
      );

      return {
        close: () => popup.close(),
      };
    },
  };
};

export const ccc = () => '';
