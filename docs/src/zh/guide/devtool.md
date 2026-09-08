---
title: Lynx DevTool
description: 在 Lynx DevTool 和它的 MCP 里读取网络与性能数据。
---

# Lynx DevTool

Lynx DevTool 没有 Network 面板。为了能在那里看到请求，网络监视器和性能监视器会把收集到的内容也打印到控制台。

## 会打印什么

每个完成的请求打印一行摘要和一个 entry 对象。这一行带 `%c` 样式，所以无论在 Lynx DevTool 还是控制台自己的 Log 标签页里，方法都显示为彩色标签，状态显示为绿色或红色：

```
GET 200 https://api.example.com/items 123ms  ▸ {url, method, requestHeaders, responseBody, …}
```

失败的请求用 `console.error` 打印，DevTool CLI 的 `--level error` 能筛出来。每条性能 entry 也以同样的方式打印：`pipeline loadBundle FCP 812.34ms` 加上 entry 对象。

在控制台自己的 Log 标签页里，这些行不是纯文本：网络行渲染成和 Network 标签页相同的条目（点击可看 General、Request、Response），性能行渲染成和 Perf 标签页相同的条目。

想把这些行单独收进一个标签页，用 `filter: isNetworkLog` 或 `filter: isPerformanceLog` 建一个[筛选标签页](/zh/guide/customizing#把控制台日志筛进一个标签页)。

## 纯文本或关闭

在 logcat、CI 日志，或读取 `get-console` 的 agent 这类渲染不了 `%c` 的地方，样式字符串会变成噪音。传 `"plain"` 改为打印无样式文本，传 `false` 则不打印：

```typescript
initNetworkMonitor({ console: "plain" });
initPerformanceMonitor({ console: false });
```
