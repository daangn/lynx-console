import type { NodesRef } from "@lynx-js/types";

// Lynx invoke 콜백을 Promise로 래핑 — 콜백 중첩 없이 await로 순차 호출 가능
export function invokeAsync<T = void>(
  ref: NodesRef | null | undefined,
  method: string,
  params?: Record<string, unknown>,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (!ref) {
      reject(new Error("ref is null"));
      return;
    }
    ref
      .invoke({
        method,
        params,
        success: (res: T) => resolve(res),
        fail: () => reject(new Error("invoke failed")),
      })
      .exec();
  });
}
