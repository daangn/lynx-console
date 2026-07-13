---
"lynx-console": patch
---

fix: widen `@lynx-js/react` peer dependency range to `>=0.110.0 <1.0.0`

In semver, a caret range on a `0.x` version only allows patch updates within the same minor (`^0.110.0` means `>=0.110.0 <0.111.0`), so projects using newer minors like `0.117.x` were getting incorrect peer dependency warnings.
