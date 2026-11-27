import { lazy, Suspense, useState } from '@lynx-js/react';
import { ActionRow, Section } from '../components';
import '../App.css';

const LynxConsole = lazy(() => import('lynx-console'));

// 이 엔트리는 lynx.config.ts 에서 enableFetchAPIStandardStreaming 을 켜서,
// 응답에 lynxExtension.streamingId 가 붙고 body.getReader() 로 chunk 를 받아요
const SSE_URL = `${__SSE_SERVER_URL__}/sse`;

type Bytes = Uint8Array<ArrayBufferLike>;

// Lynx 는 chunk 를 ArrayBuffer 로, 웹은 Uint8Array 로 줘요
const decode = (value: ArrayBuffer | Bytes): string => {
  const bytes = value instanceof ArrayBuffer ? new Uint8Array(value) : value;
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return TextCodecHelper.decode(copy.buffer);
};

const StreamingApp = () => {
  const [status, setStatus] = useState('대기 중');
  const [received, setReceived] = useState('');

  const readWithReader = async () => {
    setReceived('');
    setStatus('getReader() 로 받는 중…');
    try {
      const response = await fetch(SSE_URL, { method: 'POST' });
      const streamingId = (
        response as { lynxExtension?: { streamingId?: unknown } }
      ).lynxExtension?.streamingId;
      if (typeof streamingId !== 'string') {
        setReceived(await response.text());
        setStatus('streamingId 없음 → text() 로 한 번에 받았어요');
        return;
      }

      // Lynx 의 response.body 는 한 번만 꺼낼 수 있어요. 두 번째 접근은 "body used" 로 throw 해요
      const reader = (
        response.body as ReadableStream<ArrayBuffer | Bytes>
      ).getReader();
      let chunks = 0;
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks += 1;
        text += decode(value as ArrayBuffer | Bytes);
        setReceived(text);
      }
      setStatus(`완료 · chunk ${chunks}개 · streamingId ${streamingId}`);
    } catch (error) {
      setStatus(`실패: ${String(error)}`);
    }
  };

  const readWithText = async () => {
    setReceived('');
    setStatus('text() 로 받는 중…');
    try {
      const response = await fetch(SSE_URL);
      setReceived(await response.text());
      setStatus('완료 · text()');
    } catch (error) {
      setStatus(`실패: ${String(error)}`);
    }
  };

  return (
    <view className="app-container">
      <scroll-view className="app-list" scroll-orientation="vertical">
        <view className="app-hero">
          <text className="app-title">Streaming fetch</text>
          <text className="app-subtitle">
            로컬 SSE 서버(yarn workspace lynx-console-test sse-server)에서 받은
            응답이 Network 탭에 chunk 단위로 쌓이는지 확인해요.
          </text>
        </view>
        <Section title="SSE">
          <ActionRow
            label="body.getReader()"
            caption="chunk 를 하나씩 읽어요"
            method="POST"
            bindtap={readWithReader}
          />
          <ActionRow
            label="response.text()"
            caption="스트림을 끝까지 한 번에 읽어요"
            method="GET"
            bindtap={readWithText}
          />
        </Section>
        <Section title={status}>
          <text className="app-subtitle">
            {received || '(아직 받은 내용 없음)'}
          </text>
        </Section>
      </scroll-view>

      <Suspense fallback={<text>Loading...</text>}>
        <LynxConsole
          theme="light"
          initialPosition={{ right: 30, bottom: 200 }}
        />
      </Suspense>
    </view>
  );
};

export default StreamingApp;
