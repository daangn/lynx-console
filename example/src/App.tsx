import { lazy, Suspense } from "@lynx-js/react";
import * as css from "./App.css";

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
    <view className={css.container}>
      <view className={css.section}>
        <text className={css.sectionTitle}>Console Tests</text>
        <view bindtap={testConsoleLog} className={css.consoleButton}>
          <text className={css.consoleButtonText}>Test Console Log</text>
        </view>
        <view
          bindtap={() => {
            throw new Error("Test Error");
          }}
          className={css.consoleButton}
        >
          <text className={css.consoleButtonText}>Test throw error</text>
        </view>
        <view
          bindtap={() => {
            console.error("Test console error");
          }}
          className={css.consoleButton}
        >
          <text className={css.consoleButtonText}>Test console error</text>
        </view>
        <view
          main-thread:bindtap={testConsoleLogInMainThread}
          className={css.consoleButton}
        >
          <text className={css.consoleButtonText}>
            Test Console Log (Main Thread)
          </text>
        </view>
      </view>

      <view className={css.section}>
        <text className={css.sectionTitle}>Network Tests</text>
        <view bindtap={testGetRequest} className={css.getButton}>
          <text className={css.getButtonText}>GET Request</text>
        </view>
        <view bindtap={testPostRequest} className={css.postButton}>
          <text className={css.postButtonText}>POST Request</text>
        </view>
        <view bindtap={testPatchRequest} className={css.patchButton}>
          <text className={css.patchButtonText}>PATCH Request</text>
        </view>
        <view bindtap={testDeleteRequest} className={css.deleteButton}>
          <text className={css.deleteButtonText}>DELETE Request</text>
        </view>
      </view>

      <Suspense fallback={<text>Loading...</text>}>
        <LynxConsole safeAreaInsetBottom="0px" theme="light" />
      </Suspense>
    </view>
  );
};

export default App;
