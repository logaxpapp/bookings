import routes from '../../routing/routes';
import AuthTypeChooser from '../AuthTypeChooser';

const Registration = () => (
  <AuthTypeChooser
    companyRoute={routes.company.absolute.registration}
    userRoute={routes.user.registeration}
  />
);

export default Registration;
