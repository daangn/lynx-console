import { root } from '@lynx-js/react';
import {
  initLogMonitor,
  initMainThreadConsole,
  initNetworkMonitor,
  initPerformanceMonitor,
} from 'lynx-console/setup';
import StreamingApp from './StreamingApp';

initLogMonitor();
initMainThreadConsole();
initNetworkMonitor();
initPerformanceMonitor();

root.render(
  <page>
    <StreamingApp />
  </page>,
);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
