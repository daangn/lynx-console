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

A tab is either a content tab or a log filter tab.

| Property | Type | Description |
| --- | --- | --- |
| `key` | `string` | Unique identifier for the tab. |
| `label` | `string` | Tab label text. |
| `renderContent` | `() => ReactNode` | Content tab: renders the tab content. |
| `filter` | `string \| RegExp \| (entry: LogEntry) => boolean` | Filter tab: shows only console entries that match. A string matches when the printed text (after `%c` / `%s` formatting) contains it, a RegExp when that text passes the test. |
| `renderEntry` | `(entry: LogEntry) => ReactNode` | Filter tab, optional: renders one matched entry. Defaults to the Log tab row. |

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
| `initNetworkMonitor(options?)` | Intercepts and records `fetch` requests. |
| `initPerformanceMonitor(options?)` | Collects performance metrics. |

Tabs are only rendered for monitors that were initialized.

`options.console` (default `true`) also prints each collected entry to the console as a `%c`-styled summary line plus the entry object, so it shows up in Lynx DevTool. `"plain"` prints unstyled text, `false` prints nothing. See [Lynx DevTool](/guide/devtool).

## `isNetworkLog(entry)` / `isPerformanceLog(entry)`

Return whether a `LogEntry` is a line the network or performance monitor printed. Meant for a filter tab: `filter: isNetworkLog`.
