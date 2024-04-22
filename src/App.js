import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ContextMenu from './components/ContextMenu';
import Dialog from './lib/Dialog';
import Router from './routing/router';
import { BusyModal } from './components/Modal';

const App = () => (
  <>
    <Router />
    <Dialog />
    <ContextMenu />
    <BusyModal />
    <ToastContainer />
  </>
);

export default App;
