import { type ReactNode, useRef, useState } from "@lynx-js/react";
import type { ListSnapEvent, NodesRef } from "@lynx-js/types";
import "./Tabs.css";

type TabsProps = {
  items: Array<{
    key: string;
    label: string;
    renderContent: () => ReactNode;
  }>;
  onTabChange?: () => void;
};

export default function Tabs(props: TabsProps) {
  const tabContentsRef = useRef<NodesRef>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const tabSize =
    props.items.length < 4
      ? undefined
      : (`t${Math.max(1, 5 - (props.items.length - 3))}`);

  return (
    <view className={"tabs-root"}>
      <view className={"tabs-header"}>
        {props.items.map((item, i) => (
          <view
            key={item.key}
            className={"tabs-triggerButton"}
            bindtap={() => {
              setActiveIndex(i);
              props.onTabChange?.();

              tabContentsRef.current
                ?.invoke({
                  method: "scrollToPosition",
                  params: {
                    position: i,
                    smooth: true,
                  },
                })
                .exec();
            }}
          >
            <text
              className={`tabs-triggerButtonText${i === activeIndex ? " tabs-triggerButtonText--active" : ""}${tabSize ? ` tabs-triggerButtonText--${tabSize}` : ""}`}
            >
              {item.label}
            </text>
            {i === 0 && (
              <view
                className={"tabs-triggerIndicator"}
                style={{ transform: `translateX(${activeIndex * 100}%)` }}
              >
                <view className={"tabs-triggerIndicatorLine"} />
              </view>
            )}
          </view>
        ))}
      </view>

      <list
        ref={tabContentsRef}
        className={"tabs-contents"}
        scroll-orientation="horizontal"
        item-snap={{ factor: 0, offset: 0 }}
        bindscroll={() => props.onTabChange?.()}
        bindsnap={(e: ListSnapEvent) => {
          setActiveIndex(e.detail.position);
        }}
        bounces={false}
        preload-buffer-count={props.items.length}
      >
        {props.items.map((item) => (
          <list-item
            key={item.key}
            item-key={item.key}
            recyclable={false}
            className={"tabs-content"}
          >
            {item.renderContent()}
          </list-item>
        ))}
      </list>
    </view>
  );
}
