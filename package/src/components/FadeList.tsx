import { useRef, useState } from "@lynx-js/react";
import type { BaseEvent, NodesRef } from "@lynx-js/types";
import { vars } from "../styles/vars";
import * as css from "./FadeList.css";

interface FadeListProps {
  className?: string;
  listRef?: React.RefObject<NodesRef>;
  children: React.ReactNode;
  "preload-buffer-count"?: number;
  "initial-scroll-index"?: number;
}

export const FadeList = ({
  className,
  listRef: externalListRef,
  children,
  ...listProps
}: FadeListProps) => {
  const [fadeState, setFadeState] = useState({ atTop: true, atBottom: true });
  const fadeRef = useRef({ atTop: true, atBottom: true });
  const internalListRef = useRef<NodesRef>(null);
  const listRef = externalListRef ?? internalListRef;

  return (
    <>
      <view
        className={css.fadeTop}
        style={{
          background: fadeState.atTop
            ? "linear-gradient(to bottom, #ffffff00, #ffffff00)"
            : `linear-gradient(to bottom, ${vars.$color.bg.layerFloating}, #ffffff00)`,
        }}
      />
      <list
        ref={listRef}
        scroll-orientation="vertical"
        className={className}
        scroll-event-throttle={16}
        bindscroll={(
          e: BaseEvent<
            "bindscroll",
            {
              scrollTop: number;
              scrollHeight: number;
              listHeight: number;
            }
          >,
        ) => {
          const { scrollTop, scrollHeight, listHeight } = e.detail;
          const atTop = scrollTop <= 10;
          const atBottom = scrollTop + listHeight >= scrollHeight - 10;
          if (
            atTop !== fadeRef.current.atTop ||
            atBottom !== fadeRef.current.atBottom
          ) {
            fadeRef.current.atTop = atTop;
            fadeRef.current.atBottom = atBottom;
            setFadeState({ atTop, atBottom });
          }
        }}
        {...listProps}
      >
        {children}
      </list>
      <view
        className={css.fadeBottom}
        style={{
          background: fadeState.atBottom
            ? "linear-gradient(to top, #ffffff00, #ffffff00)"
            : `linear-gradient(to top, ${vars.$color.bg.layerFloating}, #ffffff00)`,
        }}
      />
    </>
  );
};
