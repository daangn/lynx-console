---
"lynx-console": minor
---

Add `initialPosition` prop to `LynxConsole` so the floating button's initial position can be configured. Accepts any combination of `top`/`left`/`right`/`bottom` in px — only the sides you provide are applied, so the button can be anchored to any corner (e.g. `{ top: 50, left: 16 }`). When both vertical (or both horizontal) sides are set, `top`/`left` win. Defaults to `{ right: 16, bottom: 84 }`. Once the user drags the button, the saved position takes precedence over `initialPosition`.
