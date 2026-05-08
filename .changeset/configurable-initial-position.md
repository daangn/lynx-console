---
"lynx-console": minor
---

Add `initialPosition` prop to `LynxConsole` so the floating button's initial position (`right`/`bottom` in px) can be configured. Defaults to `{ right: 16, bottom: 84 }`. Once the user drags the button, the saved position takes precedence over `initialPosition`.
