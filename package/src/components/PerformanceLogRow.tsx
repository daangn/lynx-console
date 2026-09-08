import type { PerformanceEntryData } from "../types";
import { PerformanceListItem } from "./PerformanceListItem";

interface PerformanceLogRowProps {
  perf: PerformanceEntryData;
  expanded: boolean;
  onToggle: () => void;
}

// Log 탭과 필터 탭에서 성능 로그를 Perf 탭 항목과 같은 UI 로 그려요
export const PerformanceLogRow = ({
  perf,
  expanded,
  onToggle,
}: PerformanceLogRowProps) => (
  <PerformanceListItem perf={perf} expanded={expanded} onToggle={onToggle} />
);
