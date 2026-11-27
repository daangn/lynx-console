// 스트리밍 응답의 본문은 한 번만 읽을 수 있어서 clone 해서 로깅할 수 없어요.
// 대신 페이지가 읽는 값(text/json/arrayBuffer 또는 body.getReader)을 옆에서 받아 보고해요.
// 훅은 모두 best-effort 라서, 실패해도 페이지는 손대지 않은 응답을 그대로 받아요.

export const STREAMING_BODY_PLACEHOLDER =
  "[streaming response — body is logged as the page reads it]";

type LynxStreamingResponse = { lynxExtension?: { streamingId?: unknown } };
type AnyFn = (...args: unknown[]) => unknown;

/**
 * - Lynx: 페이지 설정 `enableFetchAPIStandardStreaming` 으로 스트리밍이 켜지면
 *   네이티브가 응답에 `lynxExtension.streamingId` 를 실어요
 * - 웹이나 스트리밍이 꺼진 구엔진: SSE(`text/event-stream`)는 content-type 으로 알아봐요
 */
export const isStreamingResponse = (
  response: Response,
  mimeType: string | undefined,
): boolean =>
  mimeType === "text/event-stream" ||
  typeof (response as LynxStreamingResponse).lynxExtension?.streamingId ===
    "string";

const quietly = (fn: () => void) => {
  try {
    fn();
  } catch {}
};

const toBytes = (value: unknown): Uint8Array | null => {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  return null;
};

const decode = (bytes: Uint8Array): string => {
  if (bytes.length === 0) return "";
  const codec = (
    globalThis as { TextCodecHelper?: { decode(b: ArrayBuffer): string } }
  ).TextCodecHelper;
  // TextCodecHelper 는 ArrayBuffer 통째로 디코드해서, 뷰면 딱 맞는 복사본을 넘겨요
  if (codec) return codec.decode(bytes.slice().buffer);
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(bytes);
  }
  return `[${bytes.length} bytes — no text decoder available]`;
};

const completeUtf8Length = (bytes: Uint8Array): number => {
  // 글자 하나는 최대 4바이트라 끝 3바이트 안에서 시작 바이트를 찾아요
  for (let i = bytes.length - 1; i >= 0 && i >= bytes.length - 3; i -= 1) {
    const byte = bytes[i] as number;
    if ((byte & 0xc0) === 0x80) continue; // 이어지는 바이트(10xxxxxx)
    const size = byte >= 0xf0 ? 4 : byte >= 0xe0 ? 3 : byte >= 0xc0 ? 2 : 1;
    return i + size > bytes.length ? i : bytes.length;
  }
  return bytes.length;
};

const createStreamDecoder = () => {
  let text = "";
  let pending = new Uint8Array(0);
  return {
    push(chunk: Uint8Array): string {
      const bytes = new Uint8Array(pending.length + chunk.length);
      bytes.set(pending);
      bytes.set(chunk, pending.length);
      const end = completeUtf8Length(bytes);
      text += decode(bytes.subarray(0, end));
      pending = bytes.slice(end);
      return text;
    },
    end(): string {
      text += decode(pending);
      pending = new Uint8Array(0);
      return text;
    },
  };
};

const REPORT_INTERVAL_MS = 150;

const prettyJson = (text: string): string => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
};

const wrap = <T extends object>(
  obj: T,
  name: keyof T & string,
  after: (result: unknown) => void,
) => {
  const original = obj[name];
  if (typeof original !== "function") return;
  (obj as Record<string, AnyFn>)[name] = (...args) => {
    const result = (original as AnyFn).apply(obj, args);
    quietly(() => after(result));
    return result;
  };
};

export const tapStreamingBody = (
  response: Response,
  onBody: (body: string) => void,
): void => {
  const report = (body: string) => quietly(() => onBody(body));

  const tapMethod = (
    name: "text" | "json" | "arrayBuffer",
    format: (value: never) => string,
  ) =>
    quietly(() =>
      wrap(response, name, (promise) => {
        (promise as Promise<never>).then(
          (value) => quietly(() => report(format(value))),
          () => {},
        );
      }),
    );

  tapMethod("text", (text: string) => prettyJson(text));
  tapMethod("json", (json: unknown) => JSON.stringify(json, null, 2) ?? "");
  tapMethod("arrayBuffer", (buffer: ArrayBuffer) =>
    prettyJson(decode(new Uint8Array(buffer))),
  );

  const tapReader = (reader: ReadableStreamDefaultReader<unknown>) => {
    const decoder = createStreamDecoder();
    let text = "";
    let finished = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const scheduleReport = () => {
      if (timer !== undefined) return;
      timer = setTimeout(() => {
        timer = undefined;
        if (!finished) report(text);
      }, REPORT_INTERVAL_MS);
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      report(prettyJson(decoder.end()));
    };

    wrap(reader, "read", (promise) => {
      (promise as ReturnType<typeof reader.read>).then(
        (result) =>
          quietly(() => {
            if (finished) return;
            if (result.done) return finish();
            const bytes = toBytes(result.value);
            if (!bytes?.length) return;
            text = decoder.push(bytes);
            scheduleReport();
          }),
        () => {},
      );
    });
    wrap(reader, "cancel", () => finish());
  };

  const tappedStreams = new WeakSet<ReadableStream>();
  const tapStream = (stream: ReadableStream | null) => {
    if (!stream || tappedStreams.has(stream)) return;
    tappedStreams.add(stream);
    wrap(stream, "getReader", (reader) =>
      tapReader(reader as ReadableStreamDefaultReader<unknown>),
    );
  };

  // body 는 보통 prototype 의 getter 라서, 인스턴스에 getter 를 덮어씌워요
  quietly(() => {
    let descriptor: PropertyDescriptor | undefined;
    for (
      let owner: object | null = response;
      owner && !descriptor;
      owner = Object.getPrototypeOf(owner)
    ) {
      descriptor = Object.getOwnPropertyDescriptor(owner, "body");
    }
    if (!descriptor) return;

    const { get, value, enumerable = true } = descriptor;
    Object.defineProperty(response, "body", {
      configurable: true,
      enumerable,
      get() {
        const stream: ReadableStream | null = get ? get.call(response) : value;
        quietly(() => tapStream(stream));
        return stream;
      },
    });
  });
};
