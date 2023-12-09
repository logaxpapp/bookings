import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ContextMenu from './components/ContextMenu';
import Dialog from './lib/Dialog';
import Router from './routing/router';

const App = () => (
  <>
    <Router />
    <Dialog />
    <ContextMenu />
    <ToastContainer />
  </>
);

export default App;
