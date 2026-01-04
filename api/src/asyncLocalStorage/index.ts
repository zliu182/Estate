import { AsyncLocalStorage } from "node:async_hooks";

export type ExecContext = {
  execId: string;
  context: {
    [key: string]: any;
  };
};
export const asyncLocalStorage = new AsyncLocalStorage<ExecContext>();

export const getContext = (): {
  [key: string]: any;
} => {
  const ctx = asyncLocalStorage.getStore()?.context;
  if (ctx) {
    return ctx;
  } else {
    throw new Error("No initialized async local storage.");
  }
};

export const contextExists = (): boolean => {
  return asyncLocalStorage.getStore() ? true : false;
};
