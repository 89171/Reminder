import { createRoot } from 'react-dom/client';
import App from './App';

const { getData, saveData } = window.electron

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App getData={getData} saveData={saveData}  />);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
console.log('99999999999--', window.electron)
