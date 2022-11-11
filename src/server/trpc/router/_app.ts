// src/server/trpc/router/_app.ts
import { router } from "../trpc";
import { exampleRouter } from "./example";
import { authRouter } from "./auth";
import { theGameRouter } from "./theGame";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  theGame: theGameRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
