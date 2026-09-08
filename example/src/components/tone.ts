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
