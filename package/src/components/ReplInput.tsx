import { useRef, useState } from "@lynx-js/react";
import type { BaseEvent, InputInputEvent, NodesRef } from "@lynx-js/types";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import "./ConsolePanel.css";

const runCode = (code: string) => {
  try {
    // biome-ignore lint: intentional REPL tool
    const result = eval(code);
    if (result instanceof Promise) {
      result.then((r) => console.log(r)).catch((e) => console.error(e));
    } else {
      console.log(result);
    }
  } catch (e) {
    console.error(e);
  }
};

/** 어떤 탭을 보고 있든 항상 맨 아래에 붙는 코드 실행 줄이에요 */
export const ReplInput = () => {
  const colors = useThemeColors();
  const [code, setCode] = useState("");
  const inputRef = useRef<NodesRef>(null);

  const handleRun = () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setCode("");
    inputRef.current
      ?.invoke({ method: "setValue", params: { value: "" } })
      .exec();
    runCode(trimmed);
  };

  return (
    <view className={"cp-replInputRow"}>
      <text
        className={"cp-replPrompt t10"}
        style={{
          fontWeight: fontWeight.medium,
          color: colors.fg.placeholder,
        }}
      >
        {"›"}
      </text>
      <input
        ref={inputRef}
        className={"cp-replInput t5"}
        style={{
          fontWeight: fontWeight.regular,
          color: colors.fg.neutral,
          caretColor: colors.palette.green600,
        }}
        placeholder="enter code..."
        bindinput={(e: BaseEvent<"bindinput", InputInputEvent>) =>
          setCode(e.detail.value)
        }
        bindconfirm={handleRun}
      />
      <view
        className={"cp-replRunButton"}
        style={{ backgroundColor: colors.palette.green100 }}
        bindtap={handleRun}
      >
        <text
          className={"cp-replRunButtonText t3"}
          style={{
            fontWeight: fontWeight.medium,
            color: colors.palette.green600,
          }}
        >
          Run
        </text>
      </view>
    </view>
  );
};
