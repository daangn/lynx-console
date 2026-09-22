import { useGlobalPropsChanged, useState } from '@lynx-js/react';
import './GlobalPropsPanel.css';

// Lynx <text> 는 연속 공백을 접어서 들여쓴 JSON 이 뭉개져요.
// 그래서 중첩 객체는 점 표기(user.id)로 펼치고, 값은 한 줄로 그려요
const MAX_DEPTH = 4;

interface PropRow {
  key: string;
  value: string;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const formatValue = (value: unknown): string => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
};

const flatten = (
  source: Record<string, unknown>,
  prefix = '',
  depth = 0,
): PropRow[] =>
  Object.entries(source).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value) && depth < MAX_DEPTH) {
      const nested = flatten(value, path, depth + 1);
      // 빈 객체는 펼칠 게 없으니 값으로 보여줘요
      return nested.length > 0 ? nested : [{ key: path, value: '{}' }];
    }
    return [{ key: path, value: formatValue(value) }];
  });

/** lynx.__globalProps 를 통째로 펼쳐 보여줘요. 콘솔의 Debug 탭 본문이에요. */
export const GlobalPropsPanel = () => {
  // globalPropsMode 가 'reactive'(기본)면 호스트가 값을 바꿀 때 전체가 다시 그려져 최신 값을 읽어요.
  // 'event' 모드에서는 다시 그려주지 않으니 onGlobalPropsChanged 를 받아 직접 갱신해요
  const [, setTick] = useState(0);
  useGlobalPropsChanged(() => setTick((tick) => tick + 1));

  const globalProps = lynx.__globalProps as Record<string, unknown> | undefined;
  const rows = isPlainObject(globalProps) ? flatten(globalProps) : [];

  if (rows.length === 0) {
    return (
      <view className="globalProps-empty">
        <text className="app-caption">lynx.__globalProps 가 비어 있어요</text>
      </view>
    );
  }

  return (
    <list
      className="globalProps-list"
      scroll-orientation="vertical"
      list-type="single"
      span-count={1}
    >
      <list-item item-key="globalProps-header">
        <view className="globalProps-header">
          <text className="app-sectionTitle">
            {`lynx.__globalProps · ${rows.length}`}
          </text>
        </view>
      </list-item>
      {rows.map((row) => (
        <list-item item-key={`globalProps-${row.key}`} key={row.key}>
          <view
            className={
              row.value.length > 40
                ? 'globalProps-rowStacked'
                : 'globalProps-row'
            }
          >
            <text className="globalProps-key app-label">{row.key}</text>
            <text className="globalProps-value app-caption">{row.value}</text>
          </view>
        </list-item>
      ))}
    </list>
  );
};
