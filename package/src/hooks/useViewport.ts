import {
  useCallback,
  useEffect,
  useLynxGlobalEventListener,
  useState,
} from "@lynx-js/react";
import { isWebPlatform } from "../shared/isWebPlatform";

export interface Viewport {
  width?: number;
  height?: number;
}

function readWebViewport(): Viewport {
  // web 런타임은 lynx-view 크기를 기준으로 SystemInfo 를 채워줘요
  if (typeof SystemInfo === "undefined") return {};
  const ratio = SystemInfo.pixelRatio || 1;
  const width = SystemInfo.pixelWidth / ratio;
  const height = SystemInfo.pixelHeight / ratio;
  if (!width || !height) return {};
  return { width, height };
}

/**
 * 현재 LynxView 의 크기예요.
 *
 * 네이티브에서는 SystemInfo.pixelWidth 가 기기의 물리 화면 너비라 폴더블 · 회전 ·
 * 삽입된 화면에서 실제 layout 과 달라져요. 그래서 root 의 boundingClientRect 를 읽고,
 * 이후 변경은 runtime 의 onWindowResize 로 따라가요.
 *
 * web 런타임은 selectRoot 도 onWindowResize 도 없는 대신 SystemInfo 가 lynx-view
 * 크기를 담고 있어서 그 값을 써요.
 */
export function useViewport() {
  const [viewport, setViewport] = useState<Viewport>(() =>
    isWebPlatform ? readWebViewport() : {},
  );

  const measure = useCallback(() => {
    if (isWebPlatform) {
      setViewport(readWebViewport());
      return;
    }
    try {
      lynx
        .createSelectorQuery()
        .selectRoot()
        .invoke({
          method: "boundingClientRect",
          success: (rect: { width: number; height: number }) => {
            if (!rect?.width || !rect?.height) return;
            setViewport({ width: rect.width, height: rect.height });
          },
        })
        .exec();
    } catch {
      // 측정에 실패하면 기본 레이아웃(bottom sheet)으로 열어요
    }
  }, []);

  useEffect(() => {
    measure();
  }, [measure]);

  useLynxGlobalEventListener(
    isWebPlatform ? "__lynx_console_resize_noop__" : "onWindowResize",
    (width: number, height: number) => {
      if (!width || !height) return;
      setViewport({ width, height });
    },
  );

  return { width: viewport.width, height: viewport.height, measure };
}
