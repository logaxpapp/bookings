import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import css from './styles.module.css';
import { useNotification } from '../../../lib/Notification';
import { SubscriptionPlans } from '../../Pricing/Subscription';
import {
  selectCompany,
  selectSubscription,
  selectToken,
  updateSubscriptionPlanAsync,
} from '../../../redux/companySlice';
import { loadSubscriptionPlansAsync, selectSubscriptions } from '../../../redux/subscriptionsSlice';
import { Loader } from '../../../components/LoadingSpinner';
import routes from '../../../routing/routes';
import SlideDialog from '../../../components/SlideInDialog';
import { useDialog } from '../../../lib/Dialog';
import { SvgButton, colors, paths } from '../../../components/svg';
import { postResource } from '../../../api';
import AlertComponent from '../../../components/AlertComponents';

const CLOSE = 'close';
const RECONNECT = 'reconnect';
const CONFIRM = 'confirm';

const InfoDialog = ({
  token,
  priceId,
  currentSubscriptionName,
  selectedSubscriptionName,
  onClose,
  isDowngrade,
}) => {
  const [isOpen, setOpen] = useState(false);
  const [state, setState] = useState({
    loading: true,
    closable: false,
    data: null,
    error: null,
  });
  const notification = useNotification();
  const dispatch = useDispatch();

  const fetchInfo = useCallback(() => {
    setState((state) => ({ ...state, loading: true }));
    postResource(token, 'subscriptions/upgrade-info', { price_id: priceId }, true)
      .then((response) => {
        setState({
          loading: false,
          closable: true,
          error: false,
          data: {
            inTrialPeriod: response.inTrialPeriod,
            daysBeforeDue: response.daysBeforeDue,
            currentDueDate: new Date(response.currentDueDate).toDateString(),
            updatedDueDate: new Date(response.updatedDueDate).toDateString(),
          },
        });
      })
      .catch(({ message }) => {
        notification.showError(message);
        setState({
          loading: false,
          closable: true,
          error: true,
          data: null,
        });
      });
  }, []);

  useEffect(() => {
    setOpen(true);
    fetchInfo();
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE) {
      setOpen(false);
      setTimeout(onClose, 500);
    } else if (name === CONFIRM) {
      setState((state) => ({ ...state, loading: true }));
      dispatch(updateSubscriptionPlanAsync(priceId, (err) => {
        setState((state) => ({ ...state, loading: false }));
        if (!err) {
          setOpen(false);
          setTimeout(() => onClose(true), 500);
        }
      }));
    }
  }, [onClose]);

  return (
    <SlideDialog isIn={isOpen}>
      <div className={css.upgrade_dialog}>
        {state.loading ? (
          <Loader type="double_ring">
            <span className={css.upgrade_busy_info}>
              {`Gathering ${isDowngrade ? 'Downgrade' : 'Upgrade'} Information ...`}
            </span>
          </Loader>
        ) : (
          <SvgButton
            type="button"
            name={CLOSE}
            path={paths.close}
            color={colors.delete}
            onClick={handleClick}
            style={{
              position: 'absolute',
              right: 4,
              top: 4,
            }}
          />
        )}
        {state.data ? (
          <div className={css.upgrade_vertical_spacer}>
            <div className={css.upgrade_info_panel}>
              <div className={css.upgrade_info_row}>
                <span className={css.upgrade_info_label}>
                  Current Subscription
                </span>
                <span>{currentSubscriptionName}</span>
              </div>
              <div className={css.upgrade_info_row}>
                <span className={css.upgrade_info_label}>
                  Selected Subscription
                </span>
                <span>{selectedSubscriptionName}</span>
              </div>
              {state.data.inTrialPeriod ? (
                <AlertComponent type="info">
                  <span>
                    You are still in the free trial period.
                    Updating your subscription does NOT yet affect your access to the application.
                  </span>
                </AlertComponent>
              ) : null}
              <div className={css.upgrade_info_row}>
                <span className={css.upgrade_info_label}>
                  Due Date Before Update
                </span>
                <span>{state.data.currentDueDate}</span>
              </div>
              <div className={css.upgrade_info_row}>
                <span className={css.upgrade_info_label}>
                  Due Date After Update
                </span>
                <span>{state.data.updatedDueDate}</span>
              </div>
              <div className={css.upgrade_info_row}>
                <span className={css.upgrade_info_label}>
                  Next Payment Due In
                </span>
                <span>{`${state.data.daysBeforeDue} days`}</span>
              </div>
            </div>
            <button
              type="button"
              name={CONFIRM}
              className={css.upgrade_btn}
              onClick={handleClick}
            >
              {`Confirm ${isDowngrade ? 'Downgrade' : 'Upgrade'}`}
            </button>
          </div>
        ) : null}
        {state.error ? (
          <>
            <AlertComponent type="error">
              <span>
                An error occured while connecting with server
              </span>
            </AlertComponent>
            <button
              type="button"
              name={RECONNECT}
              className={css.upgrade_btn}
              onClick={fetchInfo}
            >
              ReConnect To Server
            </button>
          </>
        ) : null}
      </div>
    </SlideDialog>
  );
};

InfoDialog.propTypes = {
  token: PropTypes.string.isRequired,
  currentSubscriptionName: PropTypes.string.isRequired,
  selectedSubscriptionName: PropTypes.string.isRequired,
  priceId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  isDowngrade: PropTypes.bool,
};

InfoDialog.defaultProps = {
  isDowngrade: false,
};

const UpdateSubscriptionPage = () => {
  const [busy, setBusy] = useState('');
  const company = useSelector(selectCompany);
  const token = useSelector(selectToken);
  const subscriptions = useSelector(selectSubscriptions);
  const subscription = useSelector(selectSubscription);
  const dispatch = useDispatch();
  const notification = useNotification();
  const navigate = useNavigate();
  const dialog = useDialog();

  useEffect(() => {
    if (!subscriptions) {
      dispatch(loadSubscriptionPlansAsync(company.country.code));
    }
  }, []);

  const handleSelection = useCallback((data) => {
    if (data.priceId === subscription.price.id) {
      notification.showInfo(`You are already subscribed to the ${subscription.name} plan. No further action is required.`);
      return;
    }

    let popup;
    const handleClose = (updated) => {
      popup.close();
      if (updated) {
        navigate(routes.company.absolute.setup, { replace: true });
      }
    };

    popup = dialog.show(
      <InfoDialog
        token={token}
        currentSubscriptionName={subscription.name}
        selectedSubscriptionName={data.name}
        priceId={data.priceId}
        onClose={handleClose}
        isDowngrade={data.priceAmount < subscription.price.amount}
      />,
    );
  }, [subscription, company, token, setBusy]);

  return (
    <main className={css.main}>
      <header className={`${css.page_header} ${css.subscription}`}>
        <h1 className={css.page_heading}>Update Subscription Plan</h1>
        <h2 className={css.sub_heading}>
          {subscription ? (
            <>
              <span>
                {`You are currently subscribed to the ${subscription.name} plan.`}
              </span>
              <br />
            </>
          ) : null}
          <span>
            Please choose a subscription plan below to proceed
          </span>
        </h2>
      </header>
      <div className={`${css.content} ${css.subscription}`}>
        {busy ? (
          <Loader type="double_ring">
            <span>Updating Subscription ...</span>
          </Loader>
        ) : (
          <SubscriptionPlans
            subscriptions={subscriptions}
            onSelect={handleSelection}
            isUpdate
          />
        )}
      </div>
    </main>
  );
};

export default UpdateSubscriptionPage;
