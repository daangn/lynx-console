---
"lynx-console": patch
---

Add a `fail` handler to the `scrollToPosition` invoke in `LogPanel` to suppress the harmless warning that occurs when an in-progress smooth scroll is interrupted by consecutive logs.
