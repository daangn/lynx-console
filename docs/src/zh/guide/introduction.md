---
title: 介绍
description: lynx-console 是什么、能看到什么、能跑在哪里。
---

# 介绍

`lynx-console` 是一个跑在 [Lynx](https://lynxjs.org) 应用内部的开发者控制台。
不用连调试器，就能在真机上查看控制台日志、`fetch` 流量和性能指标。

## 功能一览

- **控制台** — `console.log`、`console.warn`、`console.error` 的输出，支持级别过滤、
  关键字搜索和 REPL。
- **主线程控制台** — `'main thread'` 函数里的日志同样会被捕获。
- **网络** — 每一个 `fetch` 请求的方法、状态码、请求头、请求体和响应。
- **性能** — FCP 以及其他 Lynx 性能条目，还带上原始的 entry 数据。

没有初始化的监视器，对应的标签页不会显示。

## 支持的平台

| 平台 | 状态 |
| --- | --- |
| iOS / Android（Lynx 运行时） | 支持。iOS 需要在[构建时替换 `console`](/zh/guide/getting-started#0-配置构建必需)。 |
| [Lynx Web Platform](https://lynxjs.org/guide/start/quick-start.html) | 支持 — 本站的[在线演示](/zh/guide/demo)就跑在上面。 |

## 下一步

- [快速开始](/zh/guide/getting-started) — 安装并渲染控制台。
- [体验演示](/zh/guide/demo) — 在浏览器或 Lynx Explorer 里运行示例。
- [API 参考](/zh/api/) — props、handle 和监视器初始化函数。
