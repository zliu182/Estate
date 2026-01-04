import { createLogger, debug, info, LoggerOptions, transports } from "winston";
import { da } from "zod/v4/locales";

let consoleTransport: Array<transports.ConsoleTransportInstance> = [
  new transports.Console({ level: "debug" }),
];

const loggerConfiguration: LoggerOptions = {
  transports: consoleTransport,
  levels: {
    error: 0,
    info: 1,
    debug: 2,
  },
  exceptionHandlers: consoleTransport,
};

const logger = createLogger(loggerConfiguration);

export const logInfo = (message: string, data?: unknown) => {
  const logData = {
    ts: Date.now(),
    time: new Date().toISOString(),
    data,
  };
  logger.info(message, logData);
};

export const logError = (message: string, err?: Error, data?: unknown) => {
  const logData = {
    ts: Date.now(),
    time: new Date().toISOString(),
    data,
  };
  logger.error(message, logData);
};
