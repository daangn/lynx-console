import "@lynx-js/preact-devtools";
import "@lynx-js/react/debug";
import {
  initLogMonitor,
  initMainThreadConsole,
  initNetworkMonitor,
  initPerformanceMonitor,
} from "lynx-console/setup";
import { root } from "@lynx-js/react";
import App from "./App";

initLogMonitor();
initMainThreadConsole();
initNetworkMonitor();
initPerformanceMonitor();

function AppWrapper() {
  return (
    <view className="data-seed-color-mode__light-only">
      <App />
    </view>
  );
}

root.render(<AppWrapper />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
