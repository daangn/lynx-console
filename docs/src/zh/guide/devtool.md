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

失败的请求用 `console.error` 打印，DevTool CLI 的 `--level error` 能筛出来。FCP 以 `FCP 812.34ms` 的形式和原始性能 entry 一起打印。

打印对象里的请求体和响应体在 2,000 个字符处截断。Network 标签页保留完整内容。

想把这些行单独收进一个标签页，用 `filter: isNetworkLog` 建一个[筛选标签页](/zh/guide/customizing#把控制台日志筛进一个标签页)。

## 纯文本或关闭

在 logcat、CI 日志，或读取 `get-console` 的 agent 这类渲染不了 `%c` 的地方，样式字符串会变成噪音。传 `"plain"` 改为打印无样式文本，传 `false` 则不打印：

```typescript
initNetworkMonitor({ console: "plain" });
initPerformanceMonitor({ console: false });
```

## 一次读取全部

DevTool CLI 的 `get-console` 只监听几秒，对象也只显示为 `objectId` 引用。需要完整历史时，在 DevTool 或它的 MCP 里执行：

```javascript
__LYNX_CONSOLE__.snapshot()
```

返回一个 JSON 字符串，包含最近的日志、网络 entry 和性能 entry。传 `{ limit: 50 }` 可以改变每类包含的数量（默认 100）。循环引用、`Map`、`Set`、`Error` 都会被安全序列化。
