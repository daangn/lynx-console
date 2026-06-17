import type { RefObject } from "@lynx-js/react";
import type { NodesRef } from "@lynx-js/types";
import { matchNode } from "../hooks/useNetworkSearch";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import type { NetworkEntry } from "../types";
import { getGeneralInfo } from "../utils/networkFormat";
import { HighlightText } from "./HighlightText";
import "./NetworkPanel.css";

interface NetworkGeneralSectionProps {
  network: NetworkEntry;
  searchQuery?: string | undefined;
  // 이 항목 안에서 nodeKey에 해당하는 노드의 활성 매치 등장 순번(없으면 -1)
  getActiveOccurrence?: ((nodeKey: string) => number) | undefined;
  // 활성 매치 노드면 스크롤용 ref를 돌려준다(아니면 undefined)
  getNodeRef?:
    | ((nodeKey: string) => RefObject<NodesRef> | undefined)
    | undefined;
}

export const NetworkGeneralSection = ({
  network,
  searchQuery = "",
  getActiveOccurrence = () => -1,
  getNodeRef = () => undefined,
}: NetworkGeneralSectionProps) => {
  const colors = useThemeColors();

  return (
    <view className={"np-table"}>
      {getGeneralInfo(network).map((item) => {
        // URL 행만 검색 대상 — 매치 시 강조·스크롤 ref를 단다
        const isUrl = item.key === "URL";
        return (
          <view
            key={item.key}
            ref={isUrl ? getNodeRef(matchNode.url) : undefined}
            className={"np-tableRow"}
            style={{ backgroundColor: colors.bg.neutralWeak }}
          >
            <text
              className={"np-tableKey t3"}
              style={{
                fontWeight: fontWeight.bold,
                color: colors.fg.neutralSubtle,
              }}
            >
              {item.key}
            </text>
            <HighlightText
              text={item.value}
              query={isUrl ? searchQuery : ""}
              activeOccurrence={isUrl ? getActiveOccurrence(matchNode.url) : -1}
              className={"np-tableValue t3"}
              style={{
                fontWeight: fontWeight.regular,
                color: colors.fg.neutral,
              }}
            />
          </view>
        );
      })}
    </view>
  );
};
