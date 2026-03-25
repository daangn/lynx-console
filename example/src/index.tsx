import '@lynx-js/preact-devtools';
import '@lynx-js/react/debug';
import { root } from '@lynx-js/react';
import {
  initLogMonitor,
  initMainThreadConsole,
  initNetworkMonitor,
  initPerformanceMonitor,
} from 'lynx-console/setup';
import App from './App';

initLogMonitor();
initMainThreadConsole();
initNetworkMonitor();
initPerformanceMonitor();

function AppWrapper() {
  return (
    <page>
      <App />
    </page>
  );
}

root.render(<AppWrapper />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
