import ContextMenu from './components/ContextMenu';
import Dialog from './lib/Dialog';
import Notification from './lib/Notification';
import Router from './routing/router';

const App = () => (
  <>
    <Router />
    <Dialog />
    <Notification />
    <ContextMenu />
  </>
);

export default App;
