import axios from "axios";
import jwkToPem, { RSA } from "jwk-to-pem"; // Import JWK type
import { logInfo } from "../log/logger";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import express, { RequestHandler } from "express";
import { LRUCache } from "lru-cache";
import { getEnvVariable } from "../system/index.js";
import { getContext } from "../asyncLocalStorage";

export interface JWTAuthOptions {
  keysURL: string;
  audience: string;
  issuer: string;
}

export interface AADKey {
  kid: string;
  n: string;
  e: string;
  kty: string;
  use: string;
  pem?: string;
}

const keyCache = new Map<string, AADKey>();

const fetchB2CKey = async (
  cache: LRUCache<string, AADKey>,
  b2cURL: string,
  keyId: string
): Promise<AADKey | undefined> => {
  if (!keyId) throw new Error("Missing key");

  // Check cache first
  let key = cache.get(keyId);
  if (key) {
    return key;
  }

  // Fetch keys from B2C
  logInfo("fetch-b2c-key", { b2cURL, keyId });
  const { data } = await axios.get(b2cURL);

  // Process and cache all keys
  data.keys.forEach((element: AADKey) => {
    // Convert JWK to PEM format for JWT verification
    const jwk: RSA = {
      kty: "RSA",
      n: element.n,
      e: element.e,
    };

    const pem = jwkToPem(jwk);

    cache.set(element.kid, {
      ...element,
      pem,
    });
  });

  // Return the requested key
  return cache.get(keyId);
};

const cache = new LRUCache<string, AADKey>({
  ttl: parseInt(getEnvVariable("MAX_CACHE_LIMIT", "600000")),
  max: 10,
});

export const JWTAuth = (jwtOptions: JWTAuthOptions): RequestHandler => {
  logInfo("JWTAuth-middleware", jwtOptions);

  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const skipPath = ["/live", "/ready", "/health", "/"];
      if (skipPath.indexOf(req.path) > -1 && req.method === "GET") {
        next();
      } else {
        if (!req.headers.authorization) {
          next({
            name: "Unauthorized",
            message: "No authorization header",
          });
          return;
        } else if (req.headers.authorization?.split(" ").length != 2) {
          next({
            name: "Unauthorized",
            message: "Bad aothurized header",
          });
          return;
        } else if (
          req.headers.authorization?.split(" ")[0].toLowerCase() != "bearer"
        ) {
          next({
            name: "Unauthorized",
            message: "Bad aothurized header",
          });
          return;
        } // Bearer and JWT token
        const token = req.headers.authorization?.split(" ")[1] || "";
        const jwtToken: jsonwebtoken.Jwt | null = jsonwebtoken.decode(token, {
          complete: true,
        });
        if (!jwtToken) {
          next({
            name: "Unuthorized",
            message: "JWT is uninitialized",
          });
        }
        const b2cPEM = await fetchB2CKey(
          cache,
          jwtOptions.keysURL,
          jwtToken?.header.kid!
        );
        try {
          if (!b2cPEM) {
            next({
              name: "Unauthorized",
              message: "Unable to load the pem for JWT",
            });
          } else {
            jsonwebtoken.verify(token, b2cPEM.pem!, {
              algorithms: ["RS256"],
              audience: jwtOptions.audience,
              issuer: jwtOptions.issuer,
              clockTolerance: 5,
            });
            const ctx = getContext();
            const jwtPayload = jwtToken!.payload as JwtPayload;
            ctx.mspPrincipalId =
              jwtPayload["oid"] || (jwtPayload.sub as string);
            ctx.mspUserName = jwtPayload["name"];
            next();
          }
        } catch (e) {
          next({
            name: "Unauthorized",
            message: "JWT verification failed",
            stack: e,
            jwt: jwtToken!.payload,
          });
        }
      }
    } catch (error) {
      next({
        name: "Unuthorized",
        message: "Auth error",
        stack: error,
      });
    }
  };
};
