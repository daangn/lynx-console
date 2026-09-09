import { Pressable } from './Pressable';
import { metaFg, methodChip, type Tone } from './tone';
import './ActionRow.css';

interface ActionRowContentProps {
  label: string;
  caption?: string;
  /** 오른쪽 끝에 붙는 짧은 보조 텍스트예요 (log, main thread …). */
  meta?: string;
  tone?: Tone;
  /** HTTP 메서드예요. 콘솔 Network 탭과 같은 칩으로 그려요. */
  method?: string;
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
  method,
}: ActionRowContentProps) => (
  <>
    <view className="actionRow-body">
      <text className="app-label">{label}</text>
      {caption ? <text className="app-caption">{caption}</text> : null}
    </view>
    {method ? (
      <text className={`actionRow-meta app-methodChip ${methodChip(method)}`}>
        {method}
      </text>
    ) : null}
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
