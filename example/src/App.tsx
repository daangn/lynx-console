import { lazy, Suspense } from "@lynx-js/react";
import "./App.css";

const LynxConsole = lazy(() => import("lynx-console"));

const App = () => {
  const testConsoleLog = () => {
    console.log(
      "This is a log message",
      {
        data: "test",
      },
      new Map([["key", "value"]]),
      new Set([1, 2, 3]),
    );
  };

  const testConsoleLogInMainThread = () => {
    "main thread";
    console.log("This is a log message in main thread");
  };

  const testGetRequest = async () => {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts/1",
      );
      const data = await response.json();
      console.log("GET Response:", data);
    } catch (error) {
      console.error("GET Error:", error);
    }
  };

  const testPostRequest = async () => {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Test Post",
            body: "This is a test post",
            userId: 1,
          }),
        },
      );
      const data = await response.json();
      console.log("POST Response:", data);
    } catch (error) {
      console.error("POST Error:", error);
    }
  };

  const testPatchRequest = async () => {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts/1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Updated Title",
          }),
        },
      );
      const data = await response.json();
      console.log("PATCH Response:", data);
    } catch (error) {
      console.error("PATCH Error:", error);
    }
  };

  const testDeleteRequest = async () => {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts/1",
        {
          method: "DELETE",
        },
      );
      console.log("DELETE Response:", response.status);
    } catch (error) {
      console.error("DELETE Error:", error);
    }
  };
  return (
    <view className="app-container">
      <list
        className="app-list"
        scroll-orientation="vertical"
      >
        <list-item item-key="section-console">
          <view className="app-section">
            <text className="app-sectionTitle">Console Tests</text>
            <view bindtap={testConsoleLog} className="app-baseButton app-consoleButton">
              <text className="app-buttonText app-consoleButtonText">Test Console Log</text>
            </view>
            <view
              bindtap={() => {
                throw new Error("Test Error");
              }}
              className="app-baseButton app-consoleButton"
            >
              <text className="app-buttonText app-consoleButtonText">Test throw error</text>
            </view>
            <view
              bindtap={() => {
                console.error("Test console error");
              }}
              className="app-baseButton app-consoleButton"
            >
              <text className="app-buttonText app-consoleButtonText">
                Test console error
              </text>
            </view>
            <view
              main-thread:bindtap={testConsoleLogInMainThread}
              className="app-baseButton app-consoleButton"
            >
              <text className="app-buttonText app-consoleButtonText">
                Test Console Log (Main Thread)
              </text>
            </view>
          </view>
        </list-item>

        <list-item item-key="section-network">
          <view className="app-section">
            <text className="app-sectionTitle">Network Tests</text>
            <view bindtap={testGetRequest} className="app-baseButton app-getButton">
              <text className="app-buttonText app-getButtonText">GET Request</text>
            </view>
            <view bindtap={testPostRequest} className="app-baseButton app-postButton">
              <text className="app-buttonText app-postButtonText">POST Request</text>
            </view>
            <view bindtap={testPatchRequest} className="app-baseButton app-patchButton">
              <text className="app-buttonText app-patchButtonText">PATCH Request</text>
            </view>
            <view bindtap={testDeleteRequest} className="app-baseButton app-deleteButton">
              <text className="app-buttonText app-deleteButtonText">DELETE Request</text>
            </view>
          </view>
        </list-item>

        {Array.from({ length: 20 }, (_, i) => (
          <list-item item-key={`item-${i}`} key={`item-${i}`}>
            <view
              bindtap={() => console.log(`Item ${i + 1} tapped`)}
              className="app-baseButton app-consoleButton"
              style={{ margin: "4px 16px" }}
            >
              <text className="app-buttonText app-consoleButtonText">
                List Item {i + 1}
              </text>
            </view>
          </list-item>
        ))}
      </list>

      <Suspense fallback={<text>Loading...</text>}>
        <LynxConsole
          safeAreaInsetBottom="0px"
          theme="light"
          customTabs={[
            {
              key: "custom",
              label: "Custom",
              renderContent: () => (
                <view style={{ padding: "16px" }}>
                  <text style={{ fontSize: "14px", fontWeight: "bold" }}>
                    Custom Tab
                  </text>
                  <text style={{ fontSize: "12px", marginTop: "8px" }}>
                    This is a custom tab added via the customTabs prop.
                  </text>
                </view>
              ),
            },
            {
              key: "debug",
              label: "Debug",
              renderContent: () => (
                <view style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <view
                    bindtap={() => {
                      console.log(lynx.__globalProps);
                    }}
                    className="app-baseButton app-consoleButton"
                  >
                    <text className="app-buttonText app-consoleButtonText">
                      Log globalProps
                    </text>
                  </view>

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
