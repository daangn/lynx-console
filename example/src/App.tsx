import { lazy, Suspense } from '@lynx-js/react';
import { ActionRow, ActionRowContent, Section } from './components';
import { usePressFeedback } from './hooks/usePressFeedback';
import './App.css';

const LynxConsole = lazy(() => import('lynx-console'));

const App = () => {
  // main-thread 핸들러(worklet)는 컴포넌트 prop 으로 넘기면 깨져서, 이 줄만 <view> 를 직접 만들어요
  const mainThreadRowPress = usePressFeedback('actionRow--pressed');

  const testConsoleLog = () => {
    console.log(
      'This is a log message',
      {
        data: 'test',
      },
      new Map([['key', 'value']]),
      new Set([1, 2, 3]),
    );
  };

  const testCssConsoleLog = () => {
    console.log(
      '%c [Css Test] %cscreen:home/tab:feed',
      'background: #222; color: #ff69b4; padding: 2px 4px; border-radius: 2px',
      'color: #ff6f00; font-weight: bold',
    );
    console.log('mixed format: %s got %d points (%ffps)', 'alice', 42, 59.95);
    console.log('with object %o and tail', { user: 'alice', id: 1 }, 'end');
    console.log('escaped %% percent');
  };

  // 필터 탭(Track)에서만 모아 보는 로그예요. "%c" 로 분홍 track 칩을 앞에 붙여요
  const TRACK_CHIP =
    'padding:1px 4px;border-radius:3px;font-weight:bold;background:#fdf2f8;color:#db2777';
  const testTrackEvent = (name: string) => {
    console.log(`%ctrack%c ${name}`, TRACK_CHIP, '', {
      screen: 'home',
      timestamp: Date.now(),
    });
  };

  const testConsoleLogInMainThread = () => {
    'main thread';
    console.log(
      'This is a log message in main thread',
      {
        data: 'test',
      },
      new Map([['key', 'value']]),
      new Set([1, 2, 3]),
    );
  };

  const testGetRequest = async () => {
    try {
      await fetch('https://jsonplaceholder.typicode.com/posts/1');
    } catch (error) {
      console.error('GET Error:', error);
    }
  };

  const testPostRequest = async () => {
    try {
      await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Post',
          body: 'This is a test post',
          userId: 1,
        }),
      });
    } catch (error) {
      console.error('POST Error:', error);
    }
  };

  const testPatchRequest = async () => {
    try {
      await fetch('https://jsonplaceholder.typicode.com/posts/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Updated Title',
        }),
      });
    } catch (error) {
      console.error('PATCH Error:', error);
    }
  };

  const testDeleteRequest = async () => {
    try {
      await fetch('https://jsonplaceholder.typicode.com/posts/1', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('DELETE Error:', error);
    }
  };
  // 응답 Content-Type이 application/graphql-response+json 인 케이스
  // graphql.org 공식 사이트의 예제 엔드포인트 (SWAPI 스키마)
  // 끝의 슬래시가 없으면 308 리다이렉트되므로 그대로 둬요
  const testGraphqlRequest = async () => {
    try {
      await fetch('https://graphql.org/graphql/?op=GetFilm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/graphql-response+json',
        },
        body: JSON.stringify({
          query: `query GetFilm($filmID: ID!) {
            film(filmID: $filmID) {
              title
              episodeID
              director
              releaseDate
            }
          }`,
          variables: { filmID: '1' },
        }),
      });
    } catch (error) {
      console.error('GraphQL Error:', error);
    }
  };

  return (
    <view className="app-container">
      <list className="app-list" scroll-orientation="vertical">
        <list-item item-key="hero">
          <view className="app-hero">
            <text className="app-title">lynx-console</text>
            <text className="app-subtitle">
              아래 항목을 눌러 로그와 네트워크 요청을 만들고, 오른쪽 아래 플로팅
              버튼으로 콘솔을 열어 확인해보세요.
            </text>
          </view>
        </list-item>

        <list-item item-key="section-console">
          <Section title="콘솔">
            <ActionRow
              label="Console Log"
              caption="객체 · Map · Set 을 함께 출력해요"
              meta="log"
              bindtap={testConsoleLog}
            />
            <ActionRow
              label="CSS Console Log"
              caption="서식 지정자(%c %s %d %o)를 렌더링해요"
              meta="log"
              bindtap={testCssConsoleLog}
            />
            <view
              className={`${mainThreadRowPress.className} actionRow`}
              main-thread:bindtap={testConsoleLogInMainThread}
              {...mainThreadRowPress.handlers}
            >
              <ActionRowContent
                label="Console Log"
                caption="메인 스레드에서 남기는 로그예요"
                meta="main thread"
              />
            </view>
            <ActionRow
              label="Console Error"
              caption="console.error 한 줄을 남겨요"
              meta="error"
              tone="red"
              bindtap={() => {
                console.error('Test console error');
              }}
            />
            <ActionRow
              label="Throw Error"
              caption="처리되지 않은 예외를 던져요"
              meta="error"
              tone="red"
              bindtap={() => {
                throw new Error('Test Error');
              }}
            />
          </Section>
        </list-item>

        <list-item item-key="section-track">
          <Section title="필터 탭">
            <ActionRow
              label="screen_view"
              caption="Track 탭에만 모이는 커스텀 로그예요"
              meta="track"
              tone="pink"
              bindtap={() => testTrackEvent('screen_view')}
            />
            <ActionRow
              label="button_click"
              caption="Track 탭에만 모이는 커스텀 로그예요"
              meta="track"
              tone="pink"
              bindtap={() => testTrackEvent('button_click')}
            />
          </Section>
        </list-item>

        <list-item item-key="section-network">
          <Section title="네트워크">
            <ActionRow
              label="jsonplaceholder /posts/1"
              caption="목록 한 건을 받아와요"
              method="GET"
              bindtap={testGetRequest}
            />
            <ActionRow
              label="jsonplaceholder /posts"
              caption="새 글을 만들어요"
              method="POST"
              bindtap={testPostRequest}
            />
            <ActionRow
              label="jsonplaceholder /posts/1"
              caption="제목만 바꿔요"
              method="PATCH"
              bindtap={testPatchRequest}
            />
            <ActionRow
              label="jsonplaceholder /posts/1"
              caption="한 건을 지워요"
              method="DELETE"
              bindtap={testDeleteRequest}
            />
            <ActionRow
              label="graphql.org /graphql"
              caption="graphql-response+json 응답이에요"
              method="POST"
              bindtap={testGraphqlRequest}
            />
          </Section>
        </list-item>

        <list-item item-key="section-list-header">
          <view className="section">
            <text className="section-title app-sectionTitle">스크롤 목록</text>
          </view>
        </list-item>

        {Array.from({ length: 20 }, (_, i) => (
          <list-item item-key={`item-${i}`} key={`item-${i}`}>
            <ActionRow
              label={`List Item ${i + 1}`}
              meta="log"
              bindtap={() => console.log(`Item ${i + 1} tapped`)}
            />
            {i === 19 ? <view className="app-listBottomSpace" /> : null}
          </list-item>
        ))}
      </list>

      <Suspense fallback={<text>Loading...</text>}>
        <LynxConsole
          safeAreaInsetBottom="0px"
          theme="light"
          initialPosition={{ right: 30, bottom: 200 }}
          customTabs={[
            {
              // 서식을 적용한 텍스트가 "track " 으로 시작하는 콘솔 로그만 모아 보여줘요
              key: 'track',
              label: 'Track',
              filter: /^track /,
            },
            {
              key: 'debug',
              label: 'Debug',
              renderContent: () => (
                <view className="app-debugPanel">
                  <ActionRow
                    label="Log globalProps"
                    caption="lynx.__globalProps 를 출력해요"
                    meta="log"
                    bindtap={() => {
                      console.log(lynx.__globalProps);
                    }}
                  />
                </view>
              ),
            },
          ]}
        />
      </Suspense>
    </view>
  );
};

export default App;
