---
title: Lynx DevTool
description: Reading network and performance data from Lynx DevTool and its MCP.
---

# Lynx DevTool

Lynx DevTool has no Network panel. To make requests visible there, the network and performance monitors also print what they collect to the console.

## What gets printed

Each completed request is printed as one summary line plus the entry object. The line uses `%c` styling, so the method shows as a colored chip and the status is green or red, both in Lynx DevTool and in the console's own Log tab:

```
GET 200 https://api.example.com/items 123ms  ▸ {url, method, requestHeaders, responseBody, …}
```

Failed requests use `console.error`, so `--level error` in the DevTool CLI catches them. Every performance entry is printed the same way, as `pipeline loadBundle FCP 812.34ms` with the entry object.

Inside the console's own Log tab these lines are not plain text: a network line renders as the same row as the Network tab (tap it for General, Request and Response), and a performance line renders as the same row as the Perf tab.

To collect only these lines in a tab, use a [filter tab](/guide/customizing#filtering-console-logs-into-a-tab) with `filter: isNetworkLog` or `filter: isPerformanceLog`.

## Plain text or off

`%c` styling turns into noise where nothing renders it, such as logcat, CI logs, or an agent reading `get-console`. Pass `"plain"` to print unstyled text instead, or `false` to print nothing:

```typescript
initNetworkMonitor({ console: "plain" });
initPerformanceMonitor({ console: false });
```
