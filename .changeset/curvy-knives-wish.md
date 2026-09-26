---
"lynx-console": minor
---

Add renderFloatingButton to replace or hide the default floating button, with open and isOpen render props.

Pass false to render the default button when conditionally customizing it.

Expose useFloatingButtonDrag with position, drag/overlay handlers, and child stopDragHandlers for custom buttons.

Custom drag hooks inherit LynxConsole initialPosition unless explicitly overridden.
