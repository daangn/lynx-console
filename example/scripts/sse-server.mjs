// 스트리밍 예제 페이지(streaming 엔트리)가 붙는 로컬 SSE 서버예요.
// yarn workspace lynx-console-test sse-server 로 띄우고, SSE_PORT 로 포트를 바꿀 수 있어요.
import http from 'node:http';

const port = Number(process.env.SSE_PORT) || 3100;
const EVENTS = 8;
const INTERVAL_MS = 400;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.writeHead(204).end();
    return;
  }

  if (!req.url?.startsWith('/sse')) {
    res.writeHead(404).end();
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  let count = 0;
  const timer = setInterval(() => {
    count += 1;
    if (count > EVENTS) {
      res.write('data: [DONE]\n\n');
      res.end();
      clearInterval(timer);
      return;
    }
    const payload = {
      index: count,
      text: `안녕하세요 ${count}번째 조각이에요`,
    };
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }, INTERVAL_MS);

  req.on('close', () => clearInterval(timer));
  console.log(`[sse] ${req.method} ${req.url}`);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[sse] listening on http://0.0.0.0:${port}/sse`);
});
