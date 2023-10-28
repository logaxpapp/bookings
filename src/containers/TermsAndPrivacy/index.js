import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import css from './style.module.css';
import { useDialog } from '../../lib/Dialog';
import TermsAndConditionsComponent from './TermsAndConditions';
import Header from '../Header';
import { SvgButton, colors, paths } from '../../components/svg';
import PrivacyPolicyComponent from './PriivacyPolicy';

const CLOSE = 'close';

export const TermsAndConditions = () => (
  <>
    <Header />
    <TermsAndConditionsComponent />
  </>
);

export const PrivacyPolicy = () => (
  <>
    <Header />
    <PrivacyPolicyComponent />
  </>
);

const Scaler = ({ children, onClose }) => {
  const [scaled, setScaled] = useState(false);

  useEffect(() => setScaled(true), []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE) {
      setScaled(false);
      setTimeout(onClose, 500);
    }
  }, []);

  return (
    <div className={`${css.scaler} ${scaled ? css.scaled : ''}`}>
      <div className={css.policy_wrap}>
        {children}
        <SvgButton
          type="button"
          name={CLOSE}
          title="Close"
          color={colors.delete}
          path={paths.close}
          onClick={handleClick}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 32,
            height: 32,
          }}
        />
      </div>
    </div>
  );
};

Scaler.propTypes = {
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

Scaler.defaultProps = {
  children: null,
};

export const useTermsAndConditionDialog = () => {
  const dialog = useDialog();

  return {
    show: () => {
      let popup;
      const handleClose = () => popup.close();

      popup = dialog.show(
        <Scaler onClose={handleClose}>
          <TermsAndConditionsComponent />
        </Scaler>,
      );
    },
  };
};

export const usePrivacyPolicyDialog = () => {
  const dialog = useDialog();

  return {
    show: () => {
      let popup;
      const handleClose = () => popup.close();

      popup = dialog.show(
        <Scaler onClose={handleClose}>
          <PrivacyPolicyComponent />
        </Scaler>,
      );
    },
  };
};
