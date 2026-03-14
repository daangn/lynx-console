import { type ReactNode, useRef, useState } from "@lynx-js/react";
import type { ListSnapEvent, NodesRef } from "@lynx-js/types";
import * as css from "./Tabs.css";

type TabsProps = {
  items: Array<{
    key: string;
    label: string;
    renderContent: () => ReactNode;
  }>;
};

export default function Tabs(props: TabsProps) {
  const tabContentsRef = useRef<NodesRef>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const tabSize =
    props.items.length < 4
      ? undefined
      : (`t${Math.max(1, 5 - (props.items.length - 3))}`);

  return (
    <view className={css.tabs}>
      <view className={css.tabHeader}>
        {props.items.map((item, i) => (
          <view
            key={item.key}
            className={css.tabTriggerButton}
            bindtap={() => {
              setActiveIndex(i);

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
              className={css.tabTriggerButtonText({
                active: i === activeIndex,
                size: tabSize,
              })}
            >
              {item.label}
            </text>
            {i === 0 && (
              <view
                className={css.tabTriggerIndicator}
                style={{ transform: `translateX(${activeIndex * 100}%)` }}
              >
                <view className={css.tabTriggerIndicatorLine} />
              </view>
            )}
          </view>
        ))}
      </view>

      <list
        ref={tabContentsRef}
        className={css.tabContents}
        scroll-orientation="horizontal"
        item-snap={{ factor: 0, offset: 0 }}
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
            className={css.tabContent}
          >
            {item.renderContent()}
          </list-item>
        ))}
      </list>
    </view>
  );
}
