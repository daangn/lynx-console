---
title: Introduction
description: What lynx-console is, what it shows, and where it runs.
---

# Introduction

`lynx-console` is an in-app developer console for [Lynx](https://lynxjs.org) apps.
Read console logs, `fetch` traffic, and performance metrics on a real device, with no debugger attached.

## What you get

- **Console** — `console.log`, `console.warn`, `console.error` output, with level filters,
  keyword search, and a REPL.
- **Main thread console** — logs from `'main thread'` functions are captured too.
- **Network** — every `fetch` request with its method, status, headers, request body, and response.
- **Performance** — FCP and the other Lynx performance entries, including the raw entry payload.

Tabs are not rendered for monitors you did not initialize.

## Supported platforms

| Platform | Status |
| --- | --- |
| iOS / Android (Lynx runtime) | Supported. iOS needs the [build-time `console` replacement](/guide/getting-started#0-configure-your-build-required). |
| [Lynx Web Platform](https://lynxjs.org/guide/start/quick-start.html) | Supported — the [live demo](/guide/demo) on this site runs on it. |

## Next steps

- [Getting Started](/guide/getting-started) — install it and render the console.
- [Try the Demo](/guide/demo) — run the example in your browser or in Lynx Explorer.
- [API Reference](/api/) — props, handles, and the monitor init functions.
