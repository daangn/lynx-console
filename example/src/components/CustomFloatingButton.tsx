import type { ReactNode } from '@lynx-js/react';
import type { BlurViewProps } from '@lynx-js/types';
import { useFloatingButtonDrag } from 'lynx-console';
// FCP 표시는 이 모노레포 예제에서만 내부 훅을 재사용해요.
import { useLatestFcp } from '../../../package/src/hooks/useLatestFcp';
import { isWebPlatform } from '../utils/isWebPlatform';
import './CustomFloatingButton.css';

function getEffect(): 'solid' | 'blur' | 'glass' {
  if (typeof SystemInfo === 'undefined' || isWebPlatform) return 'solid';
  const { platform, engineVersion, osVersion } = SystemInfo;
  const match = /^(\d+)\.(\d+)(?:\.|$)/.exec(engineVersion ?? '');
  if (!match) return 'solid';
  const major = Number(match[1]);
  const minor = Number(match[2]);
  if (major < 4 || (major === 4 && minor < 1)) return 'solid';
  if (platform === 'iOS') {
    return Number.parseInt(osVersion, 10) >= 26 ? 'glass' : 'blur';
  }
  return platform === 'Android' ? 'blur' : 'solid';
}

function Surface({
  children,
  reload = false,
}: {
  children: ReactNode;
  reload?: boolean;
}) {
  const effect = getEffect();
  const className = `custom-fb-surface ${reload ? 'custom-fb-reload' : 'custom-fb-main'} custom-fb-${effect}`;
  if (effect === 'solid') return <view className={className}>{children}</view>;
  const glassProps: BlurViewProps =
    effect === 'glass'
      ? {
          'blur-effect': 'glass',
          'glass-style': 'clear',
          'glass-tint-color': 'rgba(185, 199, 191, 0.12)',
          'glass-interactive': true,
        }
      : {};
  return (
    <blur-view
      className={className}
      android-capture-target="demo-blur-target"
      blur-radius="25"
      {...glassProps}
    >
      {children}
    </blur-view>
  );
}

export function CustomFloatingButton({ open }: { open: () => void }) {
  const {
    phase,
    positionStyle,
    dragHandlers,
    dragOverlayHandlers,
    stopDragHandlers,
  } = useFloatingButtonDrag({
    onTap: open,
    initialPosition: { right: 30, bottom: 200 },
  });
  const fcp = useLatestFcp();
  const color = getEffect() === 'solid' ? '#ffffff' : '#1d2025';
  const reload = () => {
    try {
      lynx.reload({}, () => {});
    } catch (error) {
      console.error('[Example] reload failed:', error);
    }
  };
  return (
    <>
      {dragOverlayHandlers && (
        <view className="custom-fb-overlay" {...dragOverlayHandlers} />
      )}
      <view
        className="custom-fb-wrapper"
        flatten={false}
        style={{
          ...positionStyle,
          transform: phase === 'dragging' ? 'scale(1.05)' : 'none',
        }}
        {...dragHandlers}
      >
        <Surface>
          <text className="custom-fb-title" style={{ color }}>
            LynxConsole
          </text>
          {(!isWebPlatform || fcp) && (
            <text
              className="custom-fb-subtitle"
              style={{ color }}
            >{`${fcp?.name ?? 'FCP'}: ${fcp?.duration ? fcp.duration.toFixed(2) : '--'}ms`}</text>
          )}
        </Surface>
        <view {...stopDragHandlers} bindtap={reload}>
          <Surface reload>
            <text className="custom-fb-reload-icon" style={{ color }}>
              {'\u21BB'}
            </text>
          </Surface>
        </view>
      </view>
    </>
  );
}
