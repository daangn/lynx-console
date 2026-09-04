import Theme, { HomeFooter } from "rspress/theme";
import { Features } from "../components/Features";
import { HomeHero } from "../components/HomeHero";
import { QuickStart } from "../components/QuickStart";

// 기본 홈 레이아웃은 히어로가 항상 가운데 정렬이라, 왼쪽 소개 / 오른쪽 데모 배치를 쓰려고
// HomeLayout 자체를 갈아끼워요. nav 나 footer 같은 나머지 크롬은 기본 Layout 이 그대로 그려요.
const HomeLayout = () => (
  <div>
    <HomeHero />
    <Features />
    <QuickStart />
    <HomeFooter />
  </div>
);

export default {
  ...Theme,
  HomeLayout,
};

export * from "rspress/theme";
