import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import "./MultiTabs.css";

export interface TabItem {
  key: string;
  label: string;
}

interface MultiTabsProps {
  // 여러 개를 동시에 켤 수 있는 필터 탭이에요. 하나도 안 켜면 전부 보여줘요
  items: TabItem[];
  selected: Set<string>;
  onToggle: (key: string) => void;
  // 본문을 통째로 갈아끼우는 콘텐츠 탭이에요. 구분선 뒤에 붙고 하나만 켜져요
  contentTabs?: TabItem[] | undefined;
  activeContentTab?: string | null | undefined;
  onContentTabToggle?: ((key: string) => void) | undefined;
}

export const MultiTabs = ({
  items,
  selected,
  onToggle,
  contentTabs,
  activeContentTab,
  onContentTabToggle,
}: MultiTabsProps) => {
  const colors = useThemeColors();
  // 콘텐츠 탭이 켜져 있는 동안은 필터가 걸리지 않으니, 켜둔 필터 탭을 흐리게 보여줘요
  const dimFilters = activeContentTab != null;
  const total = items.length + (contentTabs?.length ?? 0);
  // 탭이 많아지면 글자를 한 단계씩 줄여요
  const tabSize = total < 4 ? undefined : `t${Math.max(1, 5 - (total - 3))}`;

  const renderTab = (
    item: TabItem,
    isActive: boolean,
    tap: () => void,
    dimmed = false,
  ) => {
    const activeColor = dimmed ? colors.fg.disabled : colors.fg.neutral;
    return (
      <view key={item.key} className={"mt-triggerButton"} bindtap={tap}>
        <text
          className={`mt-triggerButtonText${tabSize ? ` ${tabSize}` : ""}`}
          style={{
            fontWeight: fontWeight.bold,
            color: isActive ? activeColor : colors.fg.neutralSubtle,
          }}
        >
          {item.label}
        </text>
        {isActive && (
          <view className={"mt-triggerIndicator"}>
            <view
              className={"mt-triggerIndicatorLine"}
              style={{ backgroundColor: activeColor }}
            />
          </view>
        )}
      </view>
    );
  };

  return (
    <view
      className={"mt-header"}
      style={{ boxShadow: `inset 0 -1px 0 0 ${colors.stroke.neutralSubtle}` }}
    >
      {items.map((item) =>
        renderTab(
          item,
          selected.has(item.key),
          () => onToggle(item.key),
          dimFilters,
        ),
      )}
      {contentTabs?.length && onContentTabToggle
        ? contentTabs.map((item) =>
            renderTab(item, activeContentTab === item.key, () =>
              onContentTabToggle(item.key),
            ),
          )
        : null}
    </view>
  );
};
