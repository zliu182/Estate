import express, { NextFunction, Request, Response } from "express";
import compression from "compression";
import { logInfo } from "./log/logger";
import { routes } from "./methods/index.js";
import {
  registerCORSHeaders,
  registerErrorHandler,
  registerHandlers,
} from "./expressMiddleware/index.js";

const app = express();
app.disabled("x-powered-by");
const port = process.env.PORT || 3001;

const version = process.env.VERSION || "No set";

registerCORSHeaders(app);
app.use(compression());

await registerHandlers(routes, app);

app.get("/", (req, res) => {
  res.send(`BackendApiVersion: ${version}`);
});
app.get("/live", (req, res) => {
  res.send("Health check passed.");
});
app.get("/ready", (req, res) => {
  res.send("Health check passed.");
});
app.get("/health", (req, res) => {
  res.send("Health check passed.");
});

app.use((req: Request, res: Response, next: NextFunction) => {
  logInfo(`${req.method} request for un-registered path ${req.path}`);
  return res.sendStatus(404);
});

await registerErrorHandler(app);

app.listen(port, () => {
  logInfo(`Application is running on port ${port}`);
});

export default app;
