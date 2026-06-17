import type { RefObject } from "@lynx-js/react";
import type { BaseEvent, InputInputEvent, NodesRef } from "@lynx-js/types";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import "./NetworkPanel.css";

interface NetworkSearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchInputRef: RefObject<NodesRef>;
  totalMatches: number;
  activeIndex: number;
  goToMatch: (delta: number) => void;
  clearNetworks: () => void;
}

export const NetworkSearchBar = ({
  searchQuery,
  setSearchQuery,
  searchInputRef,
  totalMatches,
  activeIndex,
  goToMatch,
  clearNetworks,
}: NetworkSearchBarProps) => {
  const colors = useThemeColors();
  const hasQuery = searchQuery.trim().length > 0;

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current
      ?.invoke({ method: "setValue", params: { value: "" } })
      .exec();
  };

  return (
    <view className={"np-header"}>
      <view
        className={"np-searchWrapper"}
        style={{ borderBottomColor: colors.stroke.neutralSubtle }}
      >
        <text
          className={"np-searchPrompt t6"}
          style={{
            fontWeight: fontWeight.medium,
            color: colors.fg.placeholder,
          }}
        >
          {"›"}
        </text>
        <input
          ref={searchInputRef}
          className={"np-searchInput t3"}
          style={{
            fontWeight: fontWeight.regular,
            color: colors.fg.neutral,
            caretColor: colors.palette.green600,
          }}
          placeholder="Search url, request & response..."
          bindinput={(e: BaseEvent<"bindinput", InputInputEvent>) =>
            setSearchQuery(e.detail.value)
          }
          bindconfirm={() => goToMatch(1)}
        />
        {hasQuery && (
          <view className={"np-matchNav"}>
            <text
              className={"np-matchCount t2"}
              style={{
                fontWeight: fontWeight.medium,
                color: colors.fg.neutralSubtle,
              }}
            >
              {totalMatches > 0 ? `${activeIndex + 1}/${totalMatches}` : "0/0"}
            </text>
            {[
              { delta: -1, icon: "▲" },
              { delta: 1, icon: "▼" },
            ].map(({ delta, icon }) => (
              <view
                key={icon}
                className={"np-matchNavButton"}
                style={{ backgroundColor: colors.bg.neutralWeak }}
                bindtap={() => goToMatch(delta)}
              >
                <text
                  className={"np-matchNavText t3"}
                  style={{
                    fontWeight: fontWeight.bold,
                    color:
                      totalMatches > 0
                        ? colors.fg.neutralMuted
                        : colors.fg.disabled,
                  }}
                >
                  {icon}
                </text>
              </view>
            ))}
            <view className={"np-searchClear"} bindtap={clearSearch}>
              <text
                className={"np-searchClearText t3"}
                style={{
                  fontWeight: fontWeight.medium,
                  color: colors.fg.placeholder,
                }}
              >
                ✕
              </text>
            </view>
          </view>
        )}
      </view>
      <view
        className={"np-clearButton"}
        style={{ backgroundColor: colors.bg.neutralWeak }}
        bindtap={clearNetworks}
      >
        <text
          className={"np-clearButtonText t3"}
          style={{
            fontWeight: fontWeight.medium,
            color: colors.fg.neutralMuted,
          }}
        >
          🗑
        </text>
      </view>
    </view>
  );
};
