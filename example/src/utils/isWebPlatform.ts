// 웹(<lynx-view>) 에서는 터치 이벤트 대신 마우스 이벤트가 와요.
export const isWebPlatform: boolean =
  typeof SystemInfo !== 'undefined' &&
  (SystemInfo.platform as string) === 'web';
