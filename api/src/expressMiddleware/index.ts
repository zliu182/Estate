import { randomUUID } from "node:crypto";
import express, { Express, Request, Response, NextFunction } from "express";
import {
  asyncLocalStorage,
  contextExists,
  ExecContext,
  getContext,
} from "../asyncLocalStorage";
import { logError, logInfo } from "../log/logger";
import { getEnvVariableOrThrow } from "../system";
import { BaseReq, BaseRes, IRouteMethod } from "../types/api.types";
import { JWTAuth } from "../b2c";

const keysURL = await getEnvVariableOrThrow("API_KEYS_URL");
const audience = await getEnvVariableOrThrow("API_AUDIENCE");
const issuer = await getEnvVariableOrThrow("API_ISSUER");

const setupAsyncStorage = (req: Request, res: Response, next: NextFunction) => {
  const id = randomUUID();

  try {
    const traceHeaders = {
      "x-request-id": req.headers["x-request-id"],
      "x-appgw-trace-id": req.headers["x-appgw-trace-id"],
      "user-agent": req.headers["uder-agent"],
    };
    const tRequest: ExecContext = {
      execId: id,
      context: {
        traceId: id,
      },
    };
    asyncLocalStorage.run(tRequest, logInfo, "request-headers", traceHeaders);
    asyncLocalStorage.run(tRequest, () => next());
  } catch (e) {
    next(e);
  }
};

export const registerCORSHeaders = async (app: Express) => {
  app.use(function (req: Request, res: Response, next: NextFunction) {
    res.setHeader(
      "Access-Control-Allow-Origin",
      getEnvVariableOrThrow("APPLICATION_ORIGIN")
    );
    next();
  });
};

export const registerErrorHandler = async (app: Express) => {
  app.use(
    async (error: Error, req: Request, res: Response, next: NextFunction) => {
      const traceId = contextExists() ? getContext()["traceId"] : "NotSet";
      if (error.name === "Unauthorized") {
        logError("authorization-error", error);
        res.setHeader("TRACE-ID", traceId).status(401).send("Invalid request");
      } else if (error.name === "invalid-schena-received") {
        res.setHeader("TRACE-ID", traceId).sendStatus(400).end();
      } else {
        logError("UNHANDLED ERROR: ", error, {
          requestPath: req.path,
        });
        if (!res.headersSent) {
          res.setHeader("TRACE-ID", traceId).sendStatus(500);
        }
        res.end();
      }
    }
  );
};

export const registerHandlers = async (
  routes: Array<IRouteMethod<BaseReq, BaseRes>>,
  app: Express
) => {
  for await (const route of routes) {
    logInfo("register-api", { path: route.getPath() });
    app.options(route.getPath(), function (req, res) {
      res.sendStatus(200);
    });
    app.post(
      route.getPath(),
      setupAsyncStorage,
      express.json(),
      JWTAuth({
        keysURL,
        audience,
        issuer,
      }),
      async (req: Request, res: Response, next: NextFunction) => {
        logInfo("new request", {
          routePath: route.getPath(),
        });
        const schema = route.schema();
        if (!schema) {
          throw new Error("Schema null");
        }
        try {
          await schema.parse(req.body);
          next();
        } catch {
          logError("invalid-schema-received", undefined, {
            routePath: route.getPath(),
          });
          next({
            name: "invalid-schema-received",
            messgae: "Unable to prcess schema request",
          });
        }
      },
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const request = req.body;
          const ctx = getContext();
          logInfo("Processung request", {
            routePath: route.getPath(),
          });
          res.setHeader("TRACE-ID", ctx.traceId || "");
          const data = await route.process(request);
          logInfo("Request is done", {
            routePath: route.getPath(),
          });
          res.setHeader("TRACE-ID", ctx.traceId || "");
          res.status(200);
          res.json({ ...data });
        } catch (error) {
          next(error);
        }
      }
    );
  }
};
