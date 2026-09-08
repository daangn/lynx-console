import { Pressable } from './Pressable';
import { metaFg, type Tone } from './tone';
import './ActionRow.css';

interface ActionRowContentProps {
  label: string;
  caption?: string;
  /** 오른쪽 끝에 붙는 짧은 보조 텍스트예요 (GET, main thread …). */
  meta?: string;
  tone?: Tone;
}

/**
 * 액션 한 줄의 내용이에요.
 * 탭 영역을 직접 만들어야 할 때(main-thread 핸들러 등) 이것만 가져다 써요.
 */
export const ActionRowContent = ({
  label,
  caption,
  meta,
  tone = 'neutral',
}: ActionRowContentProps) => (
  <>
    <view className="actionRow-body">
      <text className="app-label">{label}</text>
      {caption ? <text className="app-caption">{caption}</text> : null}
    </view>
    {meta ? (
      <text className={`actionRow-meta app-meta ${metaFg(tone)}`}>{meta}</text>
    ) : null}
  </>
);

interface ActionRowProps extends ActionRowContentProps {
  bindtap?: () => void;
}

/** 목록 안에 쌓아 쓰는 한 줄짜리 액션이에요. */
export const ActionRow = ({ bindtap, ...content }: ActionRowProps) => (
  <Pressable
    className="actionRow"
    pressedClassName="actionRow--pressed"
    bindtap={bindtap}
  >
    <ActionRowContent {...content} />
  </Pressable>
);
