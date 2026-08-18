import { type ReactNode, useRef, useState } from "@lynx-js/react";
import type { ListSnapEvent, NodesRef } from "@lynx-js/types";
import { isWebPlatform } from "../shared/isWebPlatform";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
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
  const colors = useThemeColors();
  const tabContentsRef = useRef<NodesRef>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const tabSize =
    props.items.length < 4
      ? undefined
      : `t${Math.max(1, 5 - (props.items.length - 3))}`;

  return (
    <view className={"tabs-root"}>
      <view
        className={"tabs-header"}
        style={{
          boxShadow: `inset 0 -1px 0 0 ${colors.stroke.neutralSubtle}`,
        }}
      >
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
              className={`tabs-triggerButtonText${tabSize ? ` ${tabSize}` : ""}`}
              style={{
                fontWeight: fontWeight.bold,
                color:
                  i === activeIndex
                    ? colors.fg.neutral
                    : colors.fg.neutralSubtle,
              }}
            >
              {item.label}
            </text>
            {i === 0 && (
              <view
                className={"tabs-triggerIndicator"}
                style={{ transform: `translateX(${activeIndex * 100}%)` }}
              >
                <view
                  className={"tabs-triggerIndicatorLine"}
                  style={{ backgroundColor: colors.fg.neutral }}
                />
              </view>
            )}
          </view>
        ))}
      </view>

      {isWebPlatform ? (
        // web x-list는 리렌더 시 가로 스크롤이 리셋되므로 display 토글로 대체해요
        <view
          className={"tabs-contents"}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {props.items.map((item, i) => (
            <view
              key={item.key}
              className={"tabs-content"}
              style={{
                display: i === activeIndex ? "flex" : "none",
                flex: 1,
              }}
            >
              {item.renderContent()}
            </view>
          ))}
        </view>
      ) : (
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
      )}
    </view>
  );
}
