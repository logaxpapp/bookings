import { useParams } from 'react-router';
import { EmailVerifiedModal, InvalidLinkModal } from './EmailVerificationModal';
import ModalPageContainer from '../ModalPageContainer';
import routes from '../../../routing/routes';

export const EmailVerificationSuccess = () => {
  const { resource } = useParams();

  return (
    <ModalPageContainer>
      <EmailVerifiedModal
        redirect={resource === 'users' ? routes.user.dashboard.absolute.home : routes.company.absolute.dashboard}
      />
    </ModalPageContainer>
  );
};

export const EmailVerificationFailure = () => (
  <ModalPageContainer>
    <InvalidLinkModal />
  </ModalPageContainer>
);
