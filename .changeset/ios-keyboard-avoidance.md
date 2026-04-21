---
"lynx-console": minor
---

Add keyboard avoidance for inputs inside `BottomSheet`. When the on-screen keyboard appears, the sheet expands by the keyboard height (capped at the max) and adds matching bottom padding so `<input>` elements (e.g. search, REPL) stay visible above the keyboard on iOS and Android.
