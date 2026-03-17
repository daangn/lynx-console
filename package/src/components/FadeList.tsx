import { useRef } from "@lynx-js/react";
import type { NodesRef } from "@lynx-js/types";

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
  const internalListRef = useRef<NodesRef>(null);
  const listRef = externalListRef ?? internalListRef;

  return (
    <list
      ref={listRef}
      scroll-orientation="vertical"
      className={className}
      {...listProps}
    >
      {children}
    </list>
  );
};
