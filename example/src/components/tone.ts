// 오른쪽 메타 텍스트에만 쓰는 강조색이에요. theme.css 의 .app-metaFg-* 와 짝이에요.
export type Tone =
  | 'neutral'
  | 'blue'
  | 'green'
  | 'purple'
  | 'red'
  | 'pink'
  | 'orange';

export const metaFg = (tone: Tone) =>
  tone === 'neutral' ? '' : `app-metaFg-${tone}`;

// 콘솔 Network 탭과 같은 메서드 칩 색이에요.
const METHOD_CLASSES = ['get', 'post', 'put', 'patch', 'delete'];

export const methodChip = (method: string) => {
  const key = method.toLowerCase();
  return METHOD_CLASSES.includes(key)
    ? `app-method-${key}`
    : 'app-method-default';
};
