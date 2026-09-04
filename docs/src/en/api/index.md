---
title: API Reference
description: Props, the console handle, and the monitor init functions.
---

# API Reference

## `LynxConsole` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `theme` | `"light" \| "dark"` | `"light"` | Console UI theme. |
| `safeAreaInsetBottom` | `string` | `"50px"` | Bottom safe area inset for the panel. |
| `customTabs` | `CustomTab[]` | `undefined` | Extra tabs to show in the console. |
| `initialPosition` | `{ top?: number; left?: number; right?: number; bottom?: number }` | `{ right: 16, bottom: 84 }` | Initial position (px) of the floating button. Each side is independent, so you can anchor it to any corner (e.g. `{ top: 50, left: 16 }`). When both `top` and `bottom` (or both `left` and `right`) are given, `top` / `left` win. Once the user drags the button, the saved position takes precedence. |

## `CustomTab`

| Property | Type | Description |
| --- | --- | --- |
| `key` | `string` | Unique identifier for the tab. |
| `label` | `string` | Tab label text. |
| `renderContent` | `() => ReactNode` | Renders the tab content. |

## `LynxConsoleHandle`

Available through a `ref` on `LynxConsole`.

| Method | Description |
| --- | --- |
| `open()` | Opens the console. |
| `close()` | Closes the console. |
| `isOpen()` | Returns whether the console is open. |

## Monitor initialization

Imported from `lynx-console/setup`, called at your app's entry point.

| Function | Description |
| --- | --- |
| `initLogMonitor()` | Captures `console.log`, `console.error`, and friends. |
| `initMainThreadConsole()` | Captures console output from the main thread. Requires `initLogMonitor()` first. |
| `initNetworkMonitor()` | Intercepts and records `fetch` requests. |
| `initPerformanceMonitor()` | Collects performance metrics. |

Tabs are only rendered for monitors that were initialized.
