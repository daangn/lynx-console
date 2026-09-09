import { useState } from '@lynx-js/react';
import { isWebPlatform } from '../utils/isWebPlatform';
import '../styles/press.css';

/**
 * 누르는 동안 살짝 줄어드는 피드백을 만들어요.
 * 반환한 className 과 handlers 를 탭 영역이 될 <view> 에 그대로 펼쳐 쓰면 돼요.
 *
 * main-thread 핸들러(worklet)는 컴포넌트 prop 으로 넘기면 깨져서,
 * 그런 경우엔 이 훅으로 <view> 를 직접 만들어요.
 */
export const usePressFeedback = (pressedClassName = '') => {
  const [pressed, setPressed] = useState(false);

  const press = () => setPressed(true);
  const release = () => setPressed(false);

  // 웹에서는 터치 이벤트가 오지 않아 마우스 이벤트로 같은 상태를 만들어요.
  const webHandlers = isWebPlatform
    ? {
        bindmousedown: press,
        bindmouseup: release,
        bindmouseleave: release,
      }
    : {};

  return {
    className: pressed
      ? `pressable pressable--pressed ${pressedClassName}`
      : 'pressable',
    handlers: {
      bindtouchstart: press,
      bindtouchend: release,
      bindtouchcancel: release,
      ...webHandlers,
    },
  };
};
