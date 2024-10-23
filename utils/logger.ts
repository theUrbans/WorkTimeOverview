import { ensureFile } from "$std/fs/ensure_file.ts";
import type { LogRecord } from "https://deno.land/std@0.224.0/log/logger.ts";
import * as log from "https://deno.land/std@0.224.0/log/mod.ts";
import { IS_BROWSER } from "$fresh/runtime.ts";

function formatter(logRecord: LogRecord): string {
  const { datetime, levelName, msg, args } = logRecord;
  let msgStr = `${datetime.toISOString()} [${levelName}] ${msg}`;

  if (args && args.length > 0) {
    msgStr += " | " + args.map((arg) => {
      return JSON.stringify(arg, null, 2);
    }).join("\n");
  }
  return msgStr;
}

const handlers: Record<string, log.BaseHandler> = {
  console: new log.ConsoleHandler("DEBUG", {
    formatter,
  }),
};

const logPath = "./logs/app.log";
if (!IS_BROWSER) {
  await ensureFile(logPath);
  handlers.file = new log.FileHandler("INFO", {
    filename: logPath,
    formatter,
  });
}

log.setup({
  handlers,
  loggers: {
    default: {
      level: "DEBUG",
      handlers: Object.keys(handlers),
    },
  },
});

export const logger = log.getLogger();
