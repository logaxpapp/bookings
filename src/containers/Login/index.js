import routes from '../../routing/routes';
import AuthTypeChooser from '../AuthTypeChooser';

const Login = () => (
  <AuthTypeChooser
    companyRoute={routes.company.absolute.login}
    userRoute={routes.user.login}
  />
);

export default Login;
