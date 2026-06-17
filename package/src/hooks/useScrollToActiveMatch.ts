import { type RefObject, useEffect, useRef } from "@lynx-js/react";
import type { NodesRef } from "@lynx-js/types";
import { invokeAsync } from "../utils/invokeAsync";
import type { NetworkTab } from "./useNetworkSearch";

// 스크롤 대상 매치의 위치 정보(null이면 스크롤하지 않음)
export interface ScrollTarget {
  entryId: string;
  entryIndex: number;
  tab: NetworkTab;
  // 노드/순번이 바뀔 때도 재스크롤하도록 effect 의존성에 쓰인다
  nodeKey: string;
  index: number;
}

// 매치 노드를 리스트 상단에 맞춘다(위/아래 모두 한 번의 scrollBy로 보정).
// 노드가 렌더돼 있고 레이아웃이 끝나야 boundingClientRect가 정확하므로,
// 측정 가능할 때만 보정하고 그렇지 못하면(가상화로 미렌더) false를 반환한다.
async function alignNodeToTop(
  listNode: NodesRef | null,
  nodeRef: NodesRef | null,
  isCancelled: () => boolean,
): Promise<boolean> {
  if (!nodeRef) return false;
  const [nodeRect, listRect] = await Promise.all([
    invokeAsync<{ top: number }>(nodeRef, "boundingClientRect"),
    invokeAsync<{ top: number }>(listNode, "boundingClientRect"),
  ]);
  if (isCancelled()) return true;
  const offset = nodeRect.top - listRect.top;
  if (Math.abs(offset) > 1) {
    await invokeAsync(listNode, "scrollBy", { offset });
  }
  return true;
}

/**
 * 활성 매치가 바뀔 때 그 노드를 리스트 상단으로 스크롤한다.
 *
 * - 같은 항목·같은 탭 안에서의 이동: 레이아웃이 이미 안정적이라 단일
 *   scrollBy로 부드럽게 정렬한다(중간 점프 없음 → 깜빡임 없음).
 * - 항목이나 탭이 바뀌는 이동: 헤더 펼침 등으로 레이아웃이 새로 잡히는데,
 *   그 직후의 boundingClientRect는 펼쳐지기 전 좌표를 줄 수 있어 측정이
 *   빗나간다. 그래서 먼저 scrollToPosition으로 항목을 상단에 올려 레이아웃을
 *   확정한 뒤 보정한다(2단계 — 한 번 점프해 보이지만 확실하다).
 */
export function useScrollToActiveMatch(
  listRef: RefObject<NodesRef>,
  activeNodeRef: RefObject<NodesRef>,
  target: ScrollTarget | null,
): void {
  // 직전에 스크롤한 항목/탭 — 같은 컨텍스트면 단일 scrollBy로 갈 수 있다
  const lastCtxRef = useRef<{ entryId: string; tab: NetworkTab } | null>(null);

  const { entryId, entryIndex, tab, nodeKey, index } = target ?? {};

  useEffect(() => {
    if (
      entryId === undefined ||
      entryIndex === undefined ||
      tab === undefined
    ) {
      return;
    }
    const listNode = listRef.current;
    let cancelled = false;
    const isCancelled = () => cancelled;

    const last = lastCtxRef.current;
    const sameContext =
      last !== null && last.entryId === entryId && last.tab === tab;
    lastCtxRef.current = { entryId, tab };

    void (async () => {
      try {
        // 같은 탭 내 이동: 단일 scrollBy
        if (
          sameContext &&
          (await alignNodeToTop(listNode, activeNodeRef.current, isCancelled))
        ) {
          return;
        }
        // 탭/항목 변경: 항목을 상단으로 올려 레이아웃 확정 후 보정(2단계)
        await invokeAsync(listNode, "scrollToPosition", {
          index: entryIndex,
          alignTo: "top",
          smooth: false,
        });
        if (cancelled) return;
        await alignNodeToTop(listNode, activeNodeRef.current, isCancelled);
      } catch {
        // 스크롤 실패(언마운트·ref 없음 등)는 무시
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [listRef, activeNodeRef, entryId, entryIndex, tab, nodeKey, index]);
}
