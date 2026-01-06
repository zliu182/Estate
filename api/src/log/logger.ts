import {
  createLogger,
  debug,
  format,
  info,
  LoggerOptions,
  transports,
} from "winston";
import type { FormatErrorResultsType } from "../types/api.types.js";
import { TransformableInfo } from "logform";

let consoleTransport: Array<transports.ConsoleTransportInstance> = [
  new transports.Console({ level: "debug" }),
];

export const formatError = <E, V>(
  _: E,
  value: V
): E | V | FormatErrorResultsType => {
  if (value instanceof Error) {
    const err: Error = value;
    const props = Object.keys(err).filter(
      (i) => i !== "message" && i !== "stack"
    );
    const results: FormatErrorResultsType = {
      message: err.message,
      stack: err.stack,
      cause: formatError(_, err.cause),
    };
    props.forEach((i) => {
      results[i as keyof FormatErrorResultsType] = (err as never)[i];
    });
    return results;
  } else {
    return value;
  }
};

export const serializaLogMessage = (info: TransformableInfo) => {
  if (info) {
    const serializaLogMessage = JSON.stringify(info, (key, value) => {
      return formatError(key, value);
    });
    return serializaLogMessage;
  } else {
    return "";
  }
};

const limitLogObj = format.printf(serializaLogMessage);

const loggerConfiguration: LoggerOptions = {
  transports: consoleTransport,
  levels: {
    error: 0,
    info: 1,
    debug: 2,
  },
  format: limitLogObj,
  exceptionHandlers: consoleTransport,
};

const logger = createLogger(loggerConfiguration);

const consoleConfiguration: LoggerOptions = {
  transports: consoleTransport,
  levels: {
    error: 0,
    info: 1,
    debug: 2,
  },
  exceptionHandlers: consoleTransport,
};

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
    err: err ? err : "",
  };
  logger.error(message, logData);
};
function i(value: string, index: number, array: string[]): void {
  throw new Error("Function not implemented.");
}
