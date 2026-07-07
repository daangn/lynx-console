---
"lynx-console": patch
---

Make the floating button draggable instantly instead of requiring a long press. This matches vConsole's drag behavior and avoids triggering the native long-press action sheet. Dragging now starts as soon as the finger moves past the threshold; a plain tap still opens the console.
