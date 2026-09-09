import type { ReactNode } from '@lynx-js/react';
import { usePressFeedback } from '../hooks/usePressFeedback';

interface PressableProps {
  children: ReactNode;
  className?: string;
  /** 눌린 동안에만 붙는 클래스예요 (배경색 등). */
  pressedClassName?: string;
  bindtap?: () => void;
}

/** 누르면 살짝 줄어드는 탭 영역이에요. */
export const Pressable = ({
  children,
  className = '',
  pressedClassName = '',
  bindtap,
}: PressableProps) => {
  const { className: pressClassName, handlers } =
    usePressFeedback(pressedClassName);

  return (
    <view
      className={`${pressClassName} ${className}`}
      bindtap={bindtap}
      {...handlers}
    >
      {children}
    </view>
  );
};
