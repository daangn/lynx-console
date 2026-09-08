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

Failed requests use `console.error`, so `--level error` in the DevTool CLI catches them. FCP is printed as `FCP 812.34ms` with the raw performance entry.

Request and response bodies in the printed object are cut at 2,000 characters. The Network tab keeps the full body.

To collect only these lines in a tab, use a [filter tab](/guide/customizing#filtering-console-logs-into-a-tab) with `filter: isNetworkLog`.

## Plain text or off

`%c` styling turns into noise where nothing renders it, such as logcat, CI logs, or an agent reading `get-console`. Pass `"plain"` to print unstyled text instead, or `false` to print nothing:

```typescript
initNetworkMonitor({ console: "plain" });
initPerformanceMonitor({ console: false });
```

## Reading everything at once

`get-console` in the DevTool CLI only listens for a few seconds and shows objects as `objectId` references. For the full history, evaluate this from DevTool or its MCP:

```javascript
__LYNX_CONSOLE__.snapshot()
```

It returns a JSON string with the latest logs, network entries, and performance entries. Pass `{ limit: 50 }` to change how many of each are included (default 100). Circular references, `Map`, `Set`, and `Error` values are serialized safely.
