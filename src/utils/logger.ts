// Credit: https://github.com/stackblitz-labs/bolt.diy/blob/main/app/utils/logger.ts
export type DebugLevel = "trace" | "debug" | "info" | "warn" | "error";
import { Chalk } from "chalk";
import moment from "moment";
import { IS_PRODUCTION } from "./env";

const chalk = new Chalk({ level: 3 });

type LoggerFunction = (...messages: any[]) => void;

interface Logger {
  trace: LoggerFunction;
  debug: LoggerFunction;
  info: LoggerFunction;
  warn: LoggerFunction;
  error: LoggerFunction;
  setLevel: (level: DebugLevel) => void;
}

// use line 21 in production
let currentLevel: DebugLevel = !IS_PRODUCTION ? "debug" : "info";
// let currentLevel: DebugLevel = !IS_PRODUCTION ? "debug" : "debug";

export const logger: Logger = {
  trace: (...messages: any[]) => log("trace", undefined, messages),
  debug: (...messages: any[]) => log("debug", undefined, messages),
  info: (...messages: any[]) => log("info", undefined, messages),
  warn: (...messages: any[]) => log("warn", undefined, messages),
  error: (...messages: any[]) => log("error", undefined, messages),
  setLevel,
};

export function createScopedLogger(scope: string): Logger {
  return {
    trace: (...messages: any[]) => log("trace", scope, messages),
    debug: (...messages: any[]) => log("debug", scope, messages),
    info: (...messages: any[]) => log("info", scope, messages),
    warn: (...messages: any[]) => log("warn", scope, messages),
    error: (...messages: any[]) => log("error", scope, messages),
    setLevel,
  };
}

function setLevel(level: DebugLevel) {
  if ((level === "trace" || level === "debug") && IS_PRODUCTION) {
    return;
  }

  currentLevel = level;
}

function log(
  level: DebugLevel,
  scope: string | undefined,
  messages: any[],
): void {
  // TODO: uncomment this when everything is ready for production
  if (IS_PRODUCTION) {
    return;
  }

  const levelOrder: DebugLevel[] = ["trace", "debug", "info", "warn", "error"];

  if (levelOrder.indexOf(level) < levelOrder.indexOf(currentLevel)) {
    return;
  }

  const allMessages = messages.reduce((acc, current) => {
    if (acc.endsWith("\n")) {
      return acc + current;
    }

    if (!acc) {
      return current;
    }

    return `${acc} ${current}`;
  }, "");

  const labelBackgroundColor = getColorForLevel(level);
  const labelTextColor = level === "warn" ? "#000000" : "#FFFFFF";

  const labelStyles = getLabelStyles(labelBackgroundColor, labelTextColor);
  const scopeStyles = getLabelStyles("#77828D", "white");

  const styles = [labelStyles];

  if (typeof scope === "string") {
    styles.push("", scopeStyles);
  }

  let labelText = formatText(
    ` ${level.toUpperCase()} `,
    labelTextColor,
    labelBackgroundColor,
  );

  if (scope) {
    const labelScope = formatText(` ${scope} `, "#FFFFFF", "77828D");
    labelText = `${labelText} ${labelScope}`;
  }

  const labelMoment = formatText(
    moment().toLocaleString(),
    "#FFFFFF",
    "77828D",
  );
  labelText = `${labelText} ${labelMoment}`;

  if (typeof window !== "undefined") {
    console.log(
      `%c${level.toUpperCase()}${scope ? `%c %c${scope}` : ""}`,
      ...styles,
      allMessages,
    );
  } else {
    console.log(`${labelText}`, allMessages);
  }
}

function formatText(text: string, color: string, bg: string) {
  return chalk.bgHex(bg)(chalk.hex(color)(text));
}

function getLabelStyles(color: string, textColor: string) {
  return `background-color: ${color}; color: white; border: 4px solid ${color}; color: ${textColor};`;
}

function getColorForLevel(level: DebugLevel): string {
  switch (level) {
    case "trace":
    case "debug": {
      return "#77828D";
    }
    case "info": {
      return "#1389FD";
    }
    case "warn": {
      return "#FFDB6C";
    }
    case "error": {
      return "#EE4744";
    }
    default: {
      return "#000000";
    }
  }
}
