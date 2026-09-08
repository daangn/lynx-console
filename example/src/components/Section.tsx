import type { ReactNode } from '@lynx-js/react';
import './Section.css';

interface SectionProps {
  title: string;
  children: ReactNode;
}

/** 제목 아래에 액션 줄들을 쌓아요. */
export const Section = ({ title, children }: SectionProps) => (
  <view className="section">
    <text className="section-title app-sectionTitle">{title}</text>
    <view className="section-rows">{children}</view>
  </view>
);
